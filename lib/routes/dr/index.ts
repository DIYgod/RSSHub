import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

const rootUrl = 'https://www.dr.dk';
const feedUrl = 'https://www.dr.dk/nyheder/service/feeds/allenyheder';

export const route: Route = {
    path: '/',
    categories: ['traditional-media'],
    example: '/dr',
    radar: [{ source: ['dr.dk/', 'dr.dk/*'], target: '/' }],
    name: 'News',
    maintainers: ['lisyer'],
    url: 'dr.dk/',
    handler,
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Math.trunc(Number(ctx.req.query('limit'))) : 20;
    const feed = await parser.parseURL(feedUrl);
    const items = (feed.items || []).slice(0, limit).map((item) => ({
        title: item.title,
        link: item.link,
        description: item['content:encoded'] || item.content || item.contentSnippet || item.summary,
        pubDate: item.isoDate ? parseDate(item.isoDate) : item.pubDate ? parseDate(item.pubDate) : undefined,
        author: item.creator || item.author,
        category: item.categories,
        guid: item.guid || item.id || item.link,
    }));
    return {
        title: feed.title || 'DR Nyheder',
        link: feed.link || rootUrl,
        description: feed.description || 'DR news feed',
        language: feed.language || 'da',
        item: items,
    };
}
