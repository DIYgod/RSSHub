import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { apiMemberRootUrl, buildHuxiuRouteTitlePrefix, fetchMemberData, processItems } from './util';

export const route: Route = {
    path: ['/author/:id/:type?', '/member/:id/:type?'],
    name: '用户',
    example: '/huxiu/member/2313050',
    categories: ['new-media'],
    parameters: { id: '用户 id，可在对应用户页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
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
    const { data: response } = await got.post(apiUrl, {
        form: {
            platform: 'www',
            uid: id,
        },
    });

    const items = await processItems(response.data.datalist, limit, cache.tryGet);

    const data = await fetchMemberData(id, type, response.data.datalist ?? [], buildHuxiuRouteTitlePrefix(route.name));

    return {
        item: items,
        ...data,
    };
}
