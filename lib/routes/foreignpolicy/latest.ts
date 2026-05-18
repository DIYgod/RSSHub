import type { Route } from '@/types';

import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

const link = 'https://foreignpolicy.com/category/latest/';
const siteUrl = 'https://foreignpolicy.com/';

export const route: Route = {
    path: '/latest',
    categories: ['traditional-media'],
    example: '/foreignpolicy/latest',
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
            source: ['foreignpolicy.com/category/latest/'],
            target: '/foreignpolicy/latest',
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

    const items = $('.excerpt-content--list')
        .toArray()
        .flatMap((element) => {
            const card = $(element);
            const anchor = card.find('a.hed-heading[href]').first();
            const href = anchor.attr('href');
            const title = normalizeText(anchor.find('.hed').first().text() || anchor.text());

            if (!href || !title) {
                return [];
            }

            const itemLink = new URL(href, link).href;
            const description = normalizeText(card.find('.dek-heading .dek, .dek').first().text());
            const author = card
                .find('.author-list .author, address.author-list a')
                .toArray()
                .map((author) => normalizeText($(author).text()))
                .filter(Boolean)
                .join(', ');
            const category = normalizeText(card.find('.department-name').first().text());
            const image = normalizeImageUrl(card.find('figure img, img').first().attr('data-src') || card.find('figure img, img').first().attr('src') || extractSrcset(card.find('figure img, img').first().attr('srcset')));

            return [
                {
                    title,
                    link: itemLink,
                    guid: card.attr('data-post-id') || itemLink,
                    description: buildDescription(description, image),
                    ...(author ? { author } : {}),
                    ...(category ? { category } : {}),
                    ...(parseDateFromUrl(itemLink) ? { pubDate: parseDateFromUrl(itemLink) } : {}),
                },
            ];
        })
        .slice(0, limit);

    return {
        title: 'Foreign Policy - Latest',
        link,
        description: 'Latest articles from Foreign Policy.',
        item: items,
    };
}

function parseDateFromUrl(itemLink: string) {
    const match = /\/(\d{4})\/(\d{2})\/(\d{2})\//.exec(itemLink);

    if (!match) {
        return;
    }

    const [, year, month, day] = match;
    return parseDate(`${year}-${month}-${day}`);
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

function extractSrcset(value?: string) {
    return value?.split(',')[0]?.trim().split(/\s+/)[0];
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
