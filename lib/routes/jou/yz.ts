import type { Route } from '@/types';

import { getItems } from './utils';

const url = 'https://yz.jou.edu.cn/index/zxgg.htm';
const host = 'https://yz.jou.edu.cn';

export const route: Route = {
    path: '/yztzgg',
    categories: ['university'],
    example: '/jou/yztzgg',
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
            source: ['yz.jou.edu.cn/index/zxgg.htm', 'yz.jou.edu.cn/'],
        },
    ],
    name: '研招网通知公告',
    maintainers: ['real-jiakai'],
    handler,
    url: 'yz.jou.edu.cn/index/zxgg.htm',
};

async function handler(ctx) {
    const out = await getItems(ctx, url, host, 'winstyle207638', 'timestyle207638', 'titlestyle207543', 'timestyle207543');

    // 生成RSS源
    return {
        // 项目标题
        title: '江苏海洋大学 -- 研招通知公告',
        // 项目链接
        link: url,
        // items的内容
        item: out,
    };
}
