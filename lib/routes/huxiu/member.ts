import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { rootUrl, apiMemberRootUrl, processItems, fetchData } from './util';

export const route: Route = {
    path: ['/author/:id/:type?', '/member/:id/:type?'],
    name: '用户',
    example: '/huxiu/member/2313050',
    categories: ['new-media'],
    parameters: { id: '用户 id，可在对应用户页 URL 中找到' },
    maintainers: ['nczitzk'],
    handler,
    description: `| TA 的文章 | TA 的 24 小时 |
| --------- | ------------- |
| article   | moment        |`,
};

async function handler(ctx) {
    const { id, type = 'article' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;

    const apiUrl = new URL(`web/${type}/${type}List`, apiMemberRootUrl).href;
    const currentUrl = new URL(`member/${id}${type === 'article' ? '' : `/${type}`}.html`, rootUrl).href;

    const { data: response } = await got.post(apiUrl, {
        form: {
            platform: 'www',
            uid: id,
        },
    });

    const items = await processItems(response.data.datalist, limit, cache.tryGet);

    const data = await fetchData(currentUrl);

    return {
        item: items,
        ...data,
    };
}
