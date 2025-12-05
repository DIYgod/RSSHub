import type { Route } from '@/types';

import { getItems } from './utils';

const url = 'https://www.jou.edu.cn/index/tzgg.htm';
const host = 'https://www.jou.edu.cn';

export const route: Route = {
    path: '/tzgg',
    categories: ['university'],
    example: '/jou/tzgg',
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
            source: ['www.jou.edu.cn/index/tzgg.htm', 'www.jou.edu.cn/'],
        },
    ],
    name: '官网通知公告',
    maintainers: ['real-jiakai'],
    handler,
    url: 'www.jou.edu.cn/index/tzgg.htm',
};

async function handler(ctx) {
    const out = await getItems(ctx, url, host, 'winstyle106390', 'timestyle106390', 'titlestyle106402', 'timestyle106402');

    // 生成RSS源
    return {
        // 项目标题
        title: '江苏海洋大学 -- 通知公告',
        // 项目链接
        link: url,
        // items的内容
        item: out,
    };
}
