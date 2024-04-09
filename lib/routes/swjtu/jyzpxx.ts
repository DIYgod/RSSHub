import { Route } from '@/types';
import cache from '@/utils/cache';
import utils from './utils';
import got from '@/utils/got';

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
    const limit = Math.min(ctx.req.query('limit') ?? 10, 50);
    const resp = await got({
        method: 'post',
        url: `${rootURL}/zpxx/search/zpxx/1/${limit}`,
    });

    const list = resp.data.data.list;

    const items = await Promise.all(
        list.map((item) => {
            const key = `${rootURL}/zpxx/data/zpxx/${item.zpxxid}`;
            return utils.descpPage(key, cache);
        })
    );

    return {
        title: '西南交大-就业招聘信息',
        link: `${rootURL}/zpxx/zpxx`,
        item: items,
        allowEmpty: true,
    };
}
