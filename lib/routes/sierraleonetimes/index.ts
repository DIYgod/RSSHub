import { load } from 'cheerio';

import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

const rootUrl = 'https://www.sierraleonetimes.com';
const feedUrl = 'https://feeds.sierraleonetimes.com/rss/8fcd2bb0346b8627';

export const route: Route = {
    path: '/',
    categories: ['traditional-media'],
    example: '/sierraleonetimes',
    radar: [{ source: ['sierraleonetimes.com/', 'sierraleonetimes.com/*'], target: '/' }],
    name: 'News',
    maintainers: ['lisyer'],
    url: 'sierraleonetimes.com/',
    handler,
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Math.trunc(Number(ctx.req.query('limit'))) : 20;
    const feed = await parser.parseURL(feedUrl);
    const items = (feed.items || []).slice(0, limit).map((item) => {
        const $ = load(item['content:encoded'] || item.content || item.summary || '');
        return {
            title: item.title,
            link: item.link,
            description: $.html() || item.contentSnippet || item.summary,
            pubDate: item.isoDate ? parseDate(item.isoDate) : item.pubDate ? parseDate(item.pubDate) : undefined,
            author: item.creator || item.author,
            category: item.categories,
            guid: item.guid || item.id || item.link,
        };
    });
    return {
        title: feed.title || 'Sierra Leone Times',
        link: feed.link || rootUrl,
        description: feed.description,
        language: feed.language || 'en',
        item: items,
    };
}
