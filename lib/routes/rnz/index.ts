import { load } from 'cheerio';

import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

const rootUrl = 'https://www.rnz.co.nz';
const feedUrl = 'https://www.rnz.co.nz/rss/news.xml';

export const route: Route = {
    path: '/',
    categories: ['traditional-media'],
    example: '/rnz',
    radar: [{ source: ['rnz.co.nz/', 'rnz.co.nz/*'], target: '/' }],
    name: 'News',
    maintainers: ['lisyer'],
    url: 'rnz.co.nz/',
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
        title: feed.title || 'RNZ',
        link: feed.link || rootUrl,
        description: feed.description,
        language: feed.language || 'en',
        item: items,
    };
}
