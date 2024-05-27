import { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

import { rootUrl, rootRSSUrl, title, categories, getInfo, processItems } from './util';

export const route: Route = {
    path: ['/cid/:id?', '/zhibo'],
    name: 'Unknown',
    maintainers: [],
    handler,
    url: 'm.mydrivers.com/',
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 100;

    const queryString = id ? `?cid=${id}` : '';
    const currentUrl = new URL(id ? `newsclass.aspx${queryString}` : '', rootUrl).href;

    const rssUrl = new URL(`rss.aspx${queryString}`, rootRSSUrl).href;

    const feed = await parser.parseURL(rssUrl);

    let items = feed.items.slice(0, limit).map((item) => ({
        title: item.title,
        link: item.link,
        description: item.content,
        author: item.creator,
        category: item.categories,
        guid: item.guid.match(/\/(\d+)\.htm/)[1],
        pubDate: parseDate(item.isoDate),
    }));

    if (id) {
        items = await processItems(items, cache.tryGet);
    }

    return {
        ...(await getInfo(currentUrl, cache.tryGet)),

        item: items,
        title: `${title} - ${feed.title.split(/_/).pop() || categories.zhibo}`,
    };
}
