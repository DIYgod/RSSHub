import type { Route } from '@/types';

import utils from './utils';

export const route: Route = {
    path: '/company',
    categories: ['other'],
    example: '/kuaidi100/company',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['kuaidi100.com/'],
        },
    ],
    name: '支持的快递公司列表',
    maintainers: ['NeverBehave'],
    handler,
    url: 'kuaidi100.com/',
};

async function handler() {
    const ls = await utils.company();
    return {
        title: `快递100 快递列表`,
        link: 'https://www.kuaidi100.com',
        description: `快递100 所支持的快递列表及其查询名称`,
        item: ls.map((item) => ({
            title: item.name,
            description: item.number,
            category: item.comTypeName,
            link: item.siteUrl,
        })),
    };
}
