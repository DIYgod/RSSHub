import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

const rootUrl = 'https://kaopu.news';
const link = `${rootUrl}/#latest`;

export const route: Route = {
    path: '/latest',
    categories: ['new-media'],
    example: '/kaopu/latest',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['kaopu.news/#latest', 'kaopu.news/'],
            target: '/kaopu/latest',
        },
    ],
    name: '\u6700\u65b0',
    maintainers: ['maxlixiang'],
    handler,
    url: 'kaopu.news/#latest',
};

async function handler(ctx) {
    const limit = getLimit(ctx);
    const { data: response } = await got(rootUrl, {
        headers: commonHeaders,
    });
    const $ = load(response);

    const items = $('#latest article.story-card')
        .toArray()
        .map((element) => {
            const card = $(element);
            const title = normalizeText(card.find('.story-title').first().text());
            const summary = normalizeText(card.find('.story-summary').first().text());
            const relativeTime = normalizeText(card.find('.story-meta span').first().text());
            const itemLink = `${link}-${encodeURIComponent(title)}`;

            return {
                title,
                link: itemLink,
                guid: itemLink,
                description: buildDescription(summary, relativeTime),
                ...(relativeTime ? { pubDate: parseRelativeDate(relativeTime) } : {}),
            };
        })
        .filter((item) => item.title)
        .slice(0, limit);

    return {
        title: '\u9760\u8c31\u65b0\u95fb - \u6700\u65b0',
        link,
        description: '\u9760\u8c31\u65b0\u95fb\u6700\u65b0\u5185\u5bb9\u3002',
        item: items,
    };
}

function getLimit(ctx) {
    const value = ctx.req.query('limit');
    const limit = value ? Number.parseInt(value, 10) : 30;

    return Number.isFinite(limit) && limit > 0 ? limit : 30;
}

function parseRelativeDate(value: string) {
    const now = Date.now();
    const number = Number.parseInt(value, 10);

    if (value.includes('\u5206\u949f') && Number.isFinite(number)) {
        return new Date(now - number * 60 * 1000);
    }

    if (value.includes('\u5c0f\u65f6') && Number.isFinite(number)) {
        return new Date(now - number * 60 * 60 * 1000);
    }

    if (value.includes('\u5929') && Number.isFinite(number)) {
        return new Date(now - number * 24 * 60 * 60 * 1000);
    }

    if (value.includes('\u6628\u5929')) {
        return new Date(now - 24 * 60 * 60 * 1000);
    }

    return new Date();
}

function normalizeText(value?: string) {
    return (value ?? '').replace(/\s+/g, ' ').trim();
}

function buildDescription(summary: string, relativeTime?: string) {
    const parts = [];

    if (summary) {
        parts.push(`<p>${escapeHtml(summary).replace(/\n/g, '<br>')}</p>`);
    }

    if (relativeTime) {
        parts.push(`<p>Updated: ${escapeHtml(relativeTime)}</p>`);
    }

    return parts.join('\n');
}

function escapeHtml(value: string) {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const commonHeaders = {
    referer: rootUrl,
    'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
};
