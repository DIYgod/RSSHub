import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.aljazeera.com';
const link = `${rootUrl}/middle-east/`;

export const route: Route = {
    path: '/middle-east',
    categories: ['traditional-media'],
    example: '/aljazeera/middle-east',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Middle East',
    maintainers: ['maxlixiang'],
    radar: [
        {
            source: ['www.aljazeera.com/middle-east/'],
            target: '/aljazeera/middle-east',
        },
    ],
    handler,
};

export async function handler(ctx) {
    const response = await ofetch(link, {
        responseType: 'text',
        headers: commonHeaders,
    });
    const $ = load(response);
    const limit = getLimit(ctx);

    const links = collectArticleLinks($).slice(0, limit);
    const items = await Promise.all(
        links.map((itemLink) =>
            cache.tryGet(itemLink, async () => {
                const detailResponse = await ofetch(itemLink, {
                    responseType: 'text',
                    headers: {
                        ...commonHeaders,
                        referer: link,
                    },
                });
                const content = load(detailResponse);

                content('.more-on').parent().remove();
                content('.responsive-image img').removeAttr('srcset');

                const title = normalizeText(content('h1').first().text() || content('meta[property="og:title"]').attr('content'));
                const image = content('.article-featured-image').html() || buildImage(content('meta[property="og:image"]').attr('content'));
                const articleBody = content('.wysiwyg').html();
                const summary = content('meta[property="og:description"]').attr('content');
                const description = buildDescription(image, articleBody || (summary ? `<p>${escapeHtml(summary)}</p>` : ''));
                const pubDate = getPublishDate(detailResponse, content);
                const author = normalizeText(content('.author').first().text());

                return {
                    title,
                    link: itemLink,
                    guid: itemLink,
                    description,
                    ...(author ? { author } : {}),
                    ...(pubDate ? { pubDate } : {}),
                };
            })
        )
    );

    return {
        title: 'Al Jazeera - Middle East News',
        link,
        description: 'Middle East news from Al Jazeera.',
        item: items.filter((item) => item.title),
    };
}

function collectArticleLinks($) {
    const seen = new Set<string>();

    return $('.u-clickable-card__link[href], a[href]')
        .toArray()
        .map((element) => $(element).attr('href'))
        .filter((href): href is string => Boolean(href))
        .map((href) => new URL(href, rootUrl).href)
        .filter((itemLink) => itemLink.startsWith(rootUrl) && /\/\d{4}\/\d{1,2}\/\d{1,2}\//.test(itemLink))
        .filter((itemLink) => {
            if (seen.has(itemLink)) {
                return false;
            }

            seen.add(itemLink);
            return true;
        });
}

function getPublishDate(response: string, $) {
    const datePublished = response.match(/"datePublished":\s*"([^"]+)"/)?.[1];
    const uploadDate = response.match(/"uploadDate":\s*"([^"]+)"/)?.[1];
    const dateFromMeta = $('meta[property="article:published_time"]').attr('content');
    const dateFromPage = $('div.date-simple > span:nth-child(2)').text();
    const date = datePublished || uploadDate || dateFromMeta || dateFromPage;

    return date ? parseDate(date) : undefined;
}

function getLimit(ctx) {
    const value = ctx.req.query('limit');
    const limit = value ? Number.parseInt(value, 10) : 30;

    return Number.isFinite(limit) && limit > 0 ? limit : 30;
}

function normalizeText(value?: string) {
    return (value ?? '').replace(/\s+/g, ' ').trim();
}

function buildImage(image?: string) {
    if (!image) {
        return '';
    }

    return `<img src="${escapeAttribute(new URL(image, rootUrl).href)}" referrerpolicy="no-referrer">`;
}

function buildDescription(image?: string, description?: string) {
    const parts = [];

    if (image) {
        parts.push(image);
    }

    if (description) {
        parts.push(description);
    }

    return parts.join('\n');
}

function escapeHtml(value: string) {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttribute(value: string) {
    return escapeHtml(value).replace(/"/g, '&quot;');
}

const commonHeaders = {
    referer: rootUrl,
    'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
};
