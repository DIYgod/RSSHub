import type { Route } from '@/types';

import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

const link = 'https://github.blog/latest/';
const siteUrl = 'https://github.blog/';

export const route: Route = {
    path: '/latest',
    categories: ['programming'],
    example: '/github/latest',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Latest',
    maintainers: ['maxlixiang'],
    radar: [
        {
            source: ['github.blog/latest/'],
            target: '/github/latest',
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

    const items = $('article.post-card')
        .toArray()
        .flatMap((element) => {
            const card = $(element);
            const anchor = card.find('a.post-card__link[href]').first();
            const href = anchor.attr('href');
            const title = normalizeText(anchor.text());

            if (!href || !title) {
                return [];
            }

            const itemLink = new URL(href, link).href;
            const description = normalizeText(card.find('.f4-mktg.color-fg-muted p').first().text());
            const author = normalizeText(card.find('a[rel="author"], .author a, .author').first().text());
            const dateText = card.find('time[datetime]').first().attr('datetime') || normalizeText(card.find('time').first().text());
            const image = normalizeImageUrl(card.find('img.wp-post-image, img').first().attr('src'));

            return [
                {
                    title,
                    link: itemLink,
                    guid: itemLink,
                    description: buildDescription(description, image),
                    ...(author ? { author } : {}),
                    ...(dateText ? { pubDate: parseDate(dateText) } : {}),
                },
            ];
        })
        .slice(0, limit);

    return {
        title: 'GitHub Blog - Latest',
        link,
        description: 'Updates, ideas, and inspiration from GitHub.',
        item: items,
    };
}

function getLimit(ctx) {
    const value = ctx.req.query('limit');
    const limit = value ? Number.parseInt(value, 10) : 20;

    return Number.isFinite(limit) && limit > 0 ? limit : 20;
}

function normalizeText(value?: string) {
    return (value ?? '').replace(/\s+/g, ' ').trim();
}

function normalizeImageUrl(value?: string) {
    if (!value) {
        return;
    }

    return new URL(value, siteUrl).href;
}

function buildDescription(description: string, image?: string) {
    const parts = [];

    if (image) {
        parts.push(`<p><img src="${escapeAttribute(image)}" referrerpolicy="no-referrer"></p>`);
    }

    if (description) {
        parts.push(`<p>${escapeHtml(description)}</p>`);
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
    referer: siteUrl,
    'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
};
