import { Route } from '@/types';
import got from '@/utils/got';
import { generateData } from './utils';

export const route: Route = {
    path: '/pin/hotlist',
    categories: ['social-media'],
    example: '/zhihu/pin/hotlist',
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
            source: ['www.zhihu.com/zhihu/bookstore/newest'],
        },
    ],
    name: '知乎想法热榜',
    maintainers: ['xyqfer'],
    handler,
    url: 'www.zhihu.com/zhihu/bookstore/newest',
};

async function handler() {
    const {
        data: { data },
    } = await got({
        method: 'get',
        url: 'https://api.zhihu.com/pins/hot_list?reverse_order=0',
    });

    return {
        title: '知乎想法热榜',
        link: 'https://www.zhihu.com/',
        description: '整点更新',
        item: generateData(data),
    };
}
