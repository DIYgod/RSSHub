import querystring from 'node:querystring';

import { config } from '@/config';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { SquareFilterType, SquarePost, SquarePostsResponse, SquareQuoteContent, SquareTranslatedData, SquareUserProfile, SquareUserProfileResponse } from './types';

const BASE_URL = 'https://www.binance.com';

const FILTER_MAP: Record<string, SquareFilterType> = {
    all: 'ALL',
    quote: 'QUOTE',
    live: 'LIVE',
};

const LANGUAGE_ALIASES: Record<string, string> = {
    'en-US': 'en',
    zh: 'zh-CN',
};

const normalizeLanguage = (lang: string) => LANGUAGE_ALIASES[lang] ?? lang;

const buildHeaders = (username: string, language: string) => ({
    Referer: `${BASE_URL}/${language}/square/profile/${username}`,
    'Accept-Language': language,
    'User-Agent': config.trueUA,
    clienttype: 'web',
    lang: language,
});

const escapeHtml = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

const textToHtml = (text: string) => escapeHtml(text).replaceAll('\n', '<br>');

const getTranslatedText = (language: string, original?: string, translated?: SquareTranslatedData | null) => {
    if (language !== 'en') {
        const localized = translated?.content || translated?.bodyTextOnly || translated?.body || translated?.title;
        if (localized) {
            return localized;
        }
    }
    return original || '';
};

const getQuoteText = (quote: SquareQuoteContent, language: string) => getTranslatedText(language, quote.bodyTextOnly || quote.title, quote.translatedData) || quote.title || '';

const getPostBody = (post: SquarePost, language: string) => {
    let mainText = getTranslatedText(language, post.bodyTextOnly, post.translatedData);
    if (!mainText && post.contentType === 4) {
        mainText = post.title || '';
    }
    return mainText;
};

const buildQuoteDescription = (quote: SquareQuoteContent, language: string) => {
    const quoteText = getQuoteText(quote, language);
    if (!quoteText) {
        return '';
    }

    let html = `<blockquote><p>${textToHtml(quoteText)}</p>`;
    const imageUrl = quote.coverMeta?.url || quote.imageLink;
    if (imageUrl) {
        html += `<p><img src="${escapeHtml(imageUrl)}"></p>`;
    }
    if (quote.webLink) {
        html += `<p><a href="${escapeHtml(quote.webLink)}">View quoted post</a></p>`;
    }
    html += '</blockquote>';
    return html;
};

const buildPostDescription = (post: SquarePost, language: string) => {
    const mainText = getPostBody(post, language);

    const parts: string[] = [];
    if (mainText) {
        parts.push(`<p>${textToHtml(mainText)}</p>`);
    }

    if (post.coverMeta?.url) {
        parts.push(`<p><img src="${escapeHtml(post.coverMeta.url)}"></p>`);
    }

    const imageUrls = post.imageMetaList?.map((image) => image.url).filter(Boolean) ?? post.imageList?.filter(Boolean) ?? [];
    for (const url of imageUrls) {
        parts.push(`<p><img src="${escapeHtml(url)}"></p>`);
    }

    if (post.quoteContent) {
        parts.push(buildQuoteDescription(post.quoteContent, language));
    }

    return parts.join('');
};

const getPostTitle = (post: SquarePost, language: string) => {
    const quoteText = post.quoteContent ? getQuoteText(post.quoteContent, language) : undefined;

    return post.title || getPostBody(post, language) || quoteText || (post.displayName ? `${post.displayName}'s post` : `Post ${post.id}`);
};

const parseRouteOptions = (routeParams?: string) => {
    const parsed = querystring.parse(routeParams);
    const rawFilter = String(parsed.filter || 'all').toLowerCase();
    const filterType = FILTER_MAP[rawFilter];

    if (!filterType) {
        throw new Error(`Filter "${rawFilter}" is not supported. Use all, quote, or live.`);
    }

    return {
        filterType,
        language: normalizeLanguage(String(parsed.lang || 'en')),
    };
};

const fetchUserProfile = (username: string, language: string) =>
    cache.tryGet(`binance:square:profile:${username.toLowerCase()}`, async () => {
        const response = await ofetch<SquareUserProfileResponse>(`${BASE_URL}/bapi/composite/v3/friendly/pgc/user/client`, {
            method: 'POST',
            headers: {
                ...buildHeaders(username, language),
                'Content-Type': 'application/json',
            },
            body: { username },
        });

        if (!response.data?.squareUid) {
            throw new Error(`User "${username}" not found on Binance Square`);
        }

        return response.data;
    });

const fetchUserPosts = async (squareUid: string, username: string, filterType: SquareFilterType, language: string) => {
    const postsUrl = new URL(`${BASE_URL}/bapi/composite/v2/friendly/pgc/content/queryUserProfilePageContentsWithFilter`);
    postsUrl.searchParams.set('targetSquareUid', squareUid);
    postsUrl.searchParams.set('timeOffset', String(Date.now()));
    postsUrl.searchParams.set('filterType', filterType);

    const response = await ofetch<SquarePostsResponse>(postsUrl.toString(), {
        headers: buildHeaders(username, language),
    });

    if (response.code !== '000000' || response.success === false) {
        throw new Error(response.message || 'Failed to fetch Binance Square posts');
    }

    return response;
};

export const route: Route = {
    path: '/square/user/:username/:routeParams?',
    categories: ['social-media'],
    view: ViewType.SocialMedia,
    example: '/binance/square/user/cz',
    parameters: {
        username: 'Binance Square username, as shown in the profile URL',
        routeParams: 'Extra parameters. Use filter and lang to customize post types and language.',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.binance.com/square/profile/:username'],
            target: '/square/user/:username',
        },
        {
            source: ['www.binance.com/:lang/square/profile/:username'],
            target: '/square/user/:username/lang=:lang',
        },
    ],
    name: 'Square Profile',
    description: `Posts from a Binance Square user profile.

| Parameter | Value | Description         |
| --------- | ----- | ------------------- |
| filter    | all   | All posts (default) |
| filter    | quote | Quote posts only    |
| filter    | live  | Live posts only     |
| lang      | en    | English (default)   |
| lang      | zh-CN | Simplified Chinese  |
| lang      | zh-TW | Traditional Chinese |
| lang      | ja    | Japanese            |

Examples:

- \`/binance/square/user/cz/filter=quote\`
- \`/binance/square/user/cz/lang=zh-CN\`
- \`/binance/square/user/cz/filter=quote&lang=zh-CN\``,
    maintainers: ['enpitsulin', 'DIYgod'],
    handler,
};

async function handler(ctx) {
    const username = ctx.req.param('username');
    const { filterType, language } = parseRouteOptions(ctx.req.param('routeParams'));

    const limit = Number.parseInt(ctx.req.query('limit') ?? '20', 10);
    const pageSize = Number.isNaN(limit) || limit <= 0 ? 20 : limit;

    const profile: SquareUserProfile = await fetchUserProfile(username, language);
    const squareUid = profile.squareUid!;
    const profileUsername = profile.username || username;
    const profileUrl = `${BASE_URL}/${language}/square/profile/${profileUsername}`;

    const postsResponse = await fetchUserPosts(squareUid, username, filterType, language);
    const contents = postsResponse.data?.contents ?? [];

    const item = contents.slice(0, pageSize).map((post) => ({
        title: getPostTitle(post, language),
        link: post.webLink || `${BASE_URL}/${language}/square/post/${post.id}`,
        pubDate: post.createTime ? parseDate(post.createTime) : undefined,
        author: post.displayName,
        category: post.hashtagList?.map((tag) => tag.trim()).filter(Boolean),
        description: buildPostDescription(post, language),
        comments: post.commentCount,
        upvotes: post.likeCount,
    }));

    const displayName = profile.displayName || profileUsername;
    const avatar = profile.avatar || undefined;

    ctx.set('json', {
        profile,
        postsResponse,
        language,
    });

    return {
        title: `${displayName} (@${profileUsername}) — Binance Square`,
        link: profileUrl,
        description: profile.biography || undefined,
        image: avatar,
        icon: avatar,
        logo: avatar,
        item,
        allowEmpty: true,
    };
}
