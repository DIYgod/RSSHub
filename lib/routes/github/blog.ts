import type { Route } from '@/types';

import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

const feedUrl = 'https://github.blog/feed/';
const siteUrl = 'https://github.blog/';

export const route: Route = {
    path: '/blog',
    categories: ['programming'],
    example: '/github/blog',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Blog',
    maintainers: ['maxlixiang'],
    radar: [
        {
            source: ['github.blog/'],
            target: '/blog',
        },
    ],
    handler,
};

async function handler(ctx) {
    const feed = await parseSourceFeed();
    const limit = getLimit(ctx);

    return {
        title: feed.title || 'GitHub Blog',
        link: feed.link || siteUrl,
        description: feed.description,
        item: feed.items.slice(0, limit).map(normalizeItem),
    };
}

async function parseSourceFeed() {
    const response = await ofetch(feedUrl, {
        responseType: 'text',
        headers: commonHeaders,
    });

    return parser.parseString(response);
}

function normalizeItem(item) {
    const pubDate = item.isoDate || item.pubDate || item.updated || item.published;

    return {
        title: item.title,
        link: item.link,
        guid: item.guid || item.link,
        description: item['content:encoded'] || item.content || item.summary || item.contentSnippet || '',
        author: item.creator || item.author,
        category: item.categories,
        ...(pubDate ? { pubDate: parseDate(pubDate) } : {}),
    };
}

function getLimit(ctx) {
    const value = ctx.req.query('limit');
    const limit = value ? Number.parseInt(value, 10) : 20;

    return Number.isFinite(limit) && limit > 0 ? limit : 20;
}

const commonHeaders = {
    'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
};
