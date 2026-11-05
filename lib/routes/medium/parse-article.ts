import { load } from 'cheerio';
import { escapeUTF8 } from 'entities/escape';

import { config } from '@/config';
import cache from '@/utils/cache';
import md5 from '@/utils/md5';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { isMediumChallenge } from './browser';
import type { PostPreview } from './graphql';

function isMediumUrl(url: URL) {
    return url.protocol === 'https:' && (url.hostname === 'medium.com' || url.hostname.endsWith('.medium.com'));
}

async function fetchArticle(url: string, cookie: string, redirects = 0): Promise<string> {
    const response = await ofetch.raw<string, 'text'>(url, {
        headers: cookie && isMediumUrl(new URL(url)) ? { cookie } : {},
        redirect: 'manual',
        responseType: 'text',
    });
    if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location || redirects >= 5) {
            throw new Error('The Medium article source returned an invalid redirect.');
        }
        const next = new URL(location, url);
        if (!['https:', 'http:'].includes(next.protocol)) {
            throw new Error('The Medium article source returned an unsupported redirect.');
        }
        return fetchArticle(next.href, cookie, redirects + 1);
    }
    return response._data ?? '';
}

async function parse(url, cookie = '') {
    const data = await fetchArticle(url, cookie);
    const $ = load(data);

    const publishedTime = $('meta[property="article:published_time"]').attr('content');
    const author = $('meta[name="author"]').attr('content');

    const article = $('body article');

    // remove header actions
    article.find('header').remove();

    // get and remove title
    const title = article.find('h1');
    const titleText = title.text();
    title.remove(); // remove title from html

    // get subtitle and remove author actions
    const subtitle = article.find('.pw-subtitle-paragraph');
    const subtitleText = subtitle.text();

    if (!titleText.trim() || !article.length || (!article.text().trim() && !article.find('img[src], video[src], audio[src], iframe[src]').length)) {
        throw new Error('The Medium article source did not contain a usable article.');
    }

    return {
        title: titleText,
        subtitle: subtitleText,
        author,
        publishedTime,
        html: article.html(),
        url,
    };
}

export default function parseArticle(ctx, url, options: { cookie?: string; post?: PostPreview } = {}) {
    const sessionKey = md5(JSON.stringify([options.cookie ?? '', config.medium.articleCookie]));
    return cache.tryGet(`medium:article:${sessionKey}:${url}`, async () => {
        try {
            const { title, author, publishedTime, html } = await parse(url, config.medium.articleCookie);

            return {
                title,
                author,
                link: url,
                description: html,
                pubDate: publishedTime ? parseDate(publishedTime) : undefined,
            };
        } catch (error) {
            const post = options.post;
            const preview = post?.extendedPreviewContent?.subtitle;
            if (!post || !isMediumChallenge(error) || post.mediumUrl !== url || !post.title?.trim() || !preview?.trim() || !(post.firstPublishedAt > 0)) {
                throw error;
            }
            return {
                title: post.title,
                author: post.creator?.name,
                link: url,
                description: `<p>${escapeUTF8(preview)}</p>`,
                pubDate: parseDate(post.firstPublishedAt),
            };
        }
    });
}
