import { Route } from '@/types';
import cache from '@/utils/cache';
import { rootUrl, apiRootUrl, processItems, getInfo } from './util';

export const route: Route = {
    path: ['/channel/:id?', '/:id?'],
    radar: {
        source: ['cyzone.cn/channel/:id', 'cyzone.cn/'],
        target: '/:id',
    },
    name: 'Unknown',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const { id = 'news' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 5;

    const apiUrl = new URL(`v2/content/channel/${id === 'news' ? 'getArticle' : 'detail'}`, apiRootUrl).href;
    const currentUrl = new URL(`channel/${id}`, rootUrl).href;

    const items = await processItems(
        apiUrl,
        limit,
        cache.tryGet,
        id === 'news'
            ? {}
            : {
                  channel_id: id,
              }
    );

    return {
        item: items,
        ...(await getInfo(currentUrl, cache.tryGet)),
    };
}
