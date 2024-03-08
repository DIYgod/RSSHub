import { Route } from '@/types';
import cache from '@/utils/cache';
import { rootUrl, apiRootUrl, types, ProcessThreads } from './utils';

export const route: Route = {
    path: ['/post/:type?/:order?', '/thread/:type?/:order?'],
    name: 'Unknown',
    maintainers: ['EthanWng97', 'DIYgod', 'nczitzk'],
    handler,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'hot';
    const order = ctx.req.param('order') ?? '';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 10;

    const apiUrl = `${apiRootUrl}/api/threads?type=${type}&includes=tags,forum_name,summary&ps=${limit}&pg=1&order=${order === '' ? '' : 'time_desc'}&is_groupid=1`;

    return {
        title: `一亩三分地 - ${types[type]}`,
        link: rootUrl,
        item: await ProcessThreads(cache.tryGet, apiUrl, order),
    };
}
