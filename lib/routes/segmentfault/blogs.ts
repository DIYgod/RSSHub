import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { acw_sc__v2, host, parseItems, parseList } from './utils';

export const route: Route = {
    path: '/blogs/:tag',
    categories: ['programming'],
    example: '/segmentfault/blogs/go',
    parameters: { tag: '标签名称，在 [标签](https://segmentfault.com/tags) 中可以找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['segmentfault.com/t/:tag/blogs'],
        },
    ],
    name: '博客',
    maintainers: ['shiluanzzz'],
    handler,
};

async function handler(ctx) {
    const tag = ctx.req.param('tag');
    const apiURL = `${host}/gateway/tag/${tag}/articles?loadMoreType=pagination&initData=true&page=1&sort=newest&pageSize=30`;
    const response = await got(apiURL);
    const data = response.data.rows;

    const list = parseList(data);

    const acwScV2Cookie = await acw_sc__v2(list[0].link, cache.tryGet);

    const items = await Promise.all(list.map((item) => parseItems(acwScV2Cookie, item, cache.tryGet)));

    return {
        title: `segmentfault-Blogs-${tag}`,
        link: `${host}/t/${tag}/blogs`,
        item: items,
    };
}
