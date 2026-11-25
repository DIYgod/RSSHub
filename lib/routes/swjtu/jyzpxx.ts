import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';

import utils from './utils';

const rootURL = 'https://jiuye.swjtu.edu.cn/career';

export const route: Route = {
    path: '/jyzpxx',
    categories: ['university'],
    example: '/swjtu/jyzpxx',
    parameters: {},
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
            source: ['jiuye.swjtu.edu.cn/career', 'jiuye.swjtu.edu.cn/'],
        },
    ],
    name: '就业招聘信息',
    maintainers: ['qizidog'],
    handler,
    url: 'jiuye.swjtu.edu.cn/career',
};

async function handler(ctx) {
    const limit = Math.min(getRouteLimit(ctx, 10), 50);
    const resp = await got({
        method: 'post',
        url: `${rootURL}/zpxx/search/zpxx/1/${limit}`,
    });

    if (!Array.isArray(resp.data.data?.list)) {
        throw new TypeError(resp.data.message || 'The recruitment website did not return a public job listing.');
    }
    const list: Array<{ zpxxid: string }> = resp.data.data.list;

    const items = await pMap(
        list,
        (item) => {
            const key = `${rootURL}/zpxx/data/zpxx/${item.zpxxid}`;
            return utils.descpPage(key, cache);
        },
        { concurrency: 3 }
    );

    return {
        title: '西南交大-就业招聘信息',
        link: `${rootURL}/zpxx/zpxx`,
        item: items,
    };
}
