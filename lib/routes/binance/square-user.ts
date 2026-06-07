import querystring from 'node:querystring';

import { config } from '@/config';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { SquareFilterType, SquarePost, SquarePostsResponse, SquareQuoteContent, SquareUserProfile, SquareUserProfileResponse } from './types';

const BASE_URL = 'https://www.binance.com';

const FILTER_MAP: Record<string, SquareFilterType> = {
    all: 'ALL',
    quote: 'QUOTE',
    live: 'LIVE',
};

const buildHeaders = (username: string) => ({
    Referer: `${BASE_URL}/square/profile/${username}`,
    'User-Agent': config.trueUA,
    clienttype: 'web',
});

const escapeHtml = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

const textToHtml = (text: string) => escapeHtml(text).replaceAll('\n', '<br>');

const buildQuoteDescription = (quote: SquareQuoteContent) => {
    const quoteText = quote.bodyTextOnly || quote.title;
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

const buildPostDescription = (post: SquarePost) => {
    let mainText = post.bodyTextOnly || '';
    if (!mainText && post.contentType === 4) {
        mainText = post.title || '';
    }

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
        parts.push(buildQuoteDescription(post.quoteContent));
    }

    return parts.join('');
};

const getPostTitle = (post: SquarePost) => post.title || post.bodyTextOnly || post.quoteContent?.title || post.quoteContent?.bodyTextOnly || (post.displayName ? `${post.displayName}'s post` : `Post ${post.id}`);

const parseFilter = (routeParams?: string) => {
    const parsed = querystring.parse(routeParams);
    const rawFilter = String(parsed.filter || 'all').toLowerCase();
    const filterType = FILTER_MAP[rawFilter];

    if (!filterType) {
        throw new Error(`Filter "${rawFilter}" is not supported. Use all, quote, or live.`);
    }

    return filterType;
};

const fetchUserProfile = (username: string) =>
    cache.tryGet(`binance:square:profile:${username.toLowerCase()}`, async () => {
        const response = await ofetch<SquareUserProfileResponse>(`${BASE_URL}/bapi/composite/v3/friendly/pgc/user/client`, {
            method: 'POST',
            headers: {
                ...buildHeaders(username),
                'Content-Type': 'application/json',
            },
            body: { username },
        });

        if (!response.data?.squareUid) {
            throw new Error(`User "${username}" not found on Binance Square`);
        }

        return response.data;
    });

const fetchUserPosts = async (squareUid: string, username: string, filterType: SquareFilterType) => {
    const postsUrl = new URL(`${BASE_URL}/bapi/composite/v2/friendly/pgc/content/queryUserProfilePageContentsWithFilter`);
    postsUrl.searchParams.set('targetSquareUid', squareUid);
    postsUrl.searchParams.set('timeOffset', String(Date.now()));
    postsUrl.searchParams.set('filterType', filterType);

    const response = await ofetch<SquarePostsResponse>(postsUrl.toString(), {
        headers: buildHeaders(username),
    });

    if (response.code !== '000000' || response.success === false) {
        throw new Error(response.message || 'Failed to fetch Binance Square posts');
    }

    return response;
};

export const route: Route = {
    path: ['/square/user/:username/:routeParams?', '/square/profile/:username/:routeParams?'],
    categories: ['social-media'],
    view: ViewType.SocialMedia,
    example: '/binance/square/user/cz',
    parameters: {
        username: 'Binance Square username, as shown in the profile URL',
        routeParams: 'Filter parameter. Use filter to customize post types.',
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
    ],
    name: 'Square Profile',
    description: `Posts from a Binance Square user profile.

| Filter Value | Description         |
| ------------ | ------------------- |
| all          | All posts (default) |
| quote        | Quote posts only    |
| live         | Live posts only     |

Default value for filter is \`all\` if not specified.

Example:

- \`/binance/square/user/cz/filter=quote\``,
    maintainers: ['enpitsulin', 'DIYgod'],
    handler,
};

async function handler(ctx) {
    const username = ctx.req.param('username');
    const filterType = parseFilter(ctx.req.param('routeParams'));

    const limit = Number.parseInt(ctx.req.query('limit') ?? '20', 10);
    const pageSize = Number.isNaN(limit) || limit <= 0 ? 20 : limit;

    const profile: SquareUserProfile = await fetchUserProfile(username);
    const squareUid = profile.squareUid!;
    const profileUsername = profile.username || username;
    const profileUrl = `${BASE_URL}/square/profile/${profileUsername}`;

    const postsResponse = await fetchUserPosts(squareUid, username, filterType);
    const contents = postsResponse.data?.contents ?? [];

    const item = contents.slice(0, pageSize).map((post) => ({
        title: getPostTitle(post),
        link: post.webLink || `${BASE_URL}/square/post/${post.id}`,
        pubDate: post.createTime ? parseDate(post.createTime) : undefined,
        author: post.displayName,
        category: post.hashtagList?.map((tag) => tag.trim()).filter(Boolean),
        description: buildPostDescription(post),
        comments: post.commentCount,
        upvotes: post.likeCount,
    }));

    const displayName = profile.displayName || profileUsername;
    const avatar = profile.avatar || undefined;

    ctx.set('json', {
        profile,
        postsResponse,
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
