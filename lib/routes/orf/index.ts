import { load } from 'cheerio';

import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

const rootUrl = 'https://orf.at';
const feedUrl = 'https://rss.orf.at/news.xml';

export const route: Route = {
    path: '/',
    categories: ['traditional-media'],
    example: '/orf',
    radar: [{ source: ['orf.at/', 'orf.at/*'], target: '/' }],
    name: 'News',
    maintainers: ['lisyer'],
    url: 'orf.at/',
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
        title: feed.title || 'ORF',
        link: feed.link || rootUrl,
        description: feed.description,
        language: feed.language || 'de',
        item: items,
    };
}
