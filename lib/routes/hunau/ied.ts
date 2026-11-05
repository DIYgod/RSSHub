import type { Route } from '@/types';

import { getContent } from './utils/common';

export const route: Route = {
    path: '/ied/:type?/:category?',
    categories: ['university'],
    example: '/hunau/ied',
    parameters: { type: '页面归属，默认为 `xwzx`', category: '页面分类，默认为 `ggtz`' },
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
            source: ['ied.hunau.edu.cn/'],
            target: '/ied',
        },
        {
            source: ['ied.hunau.edu.cn/xwzx/ggtz', 'ied.hunau.edu.cn/xwzx/ggtz/index.html'],
            target: '/ied/xwzx/ggtz',
        },
    ],
    name: '国际交流与合作处、国际教育学院、港澳台事务办公室',
    maintainers: ['lcandy2'],
    handler,
    url: 'ied.hunau.edu.cn/',
    description: `| 分类     | 公告通知 | 新闻快讯 | 其他分类... |
| -------- | -------- | -------- | ----------- |
| type     | xwzx     | xwzx     | 对应 URL    |
| category | ggtz     | xwkx     | 对应 URL    |`,
};

async function handler(ctx) {
    return await getContent(ctx, {
        baseHost: 'https://ied.hunau.edu.cn',
        baseCategory: 'ggtz', // Default: notices
        baseType: 'xwzx', // Default: news
        baseTitle: '国际交流与合作处',
        baseDescription: '湖南农业大学国际交流与合作处、国际教育学院、港澳台事务办公室',
        baseDeparment: 'ied',
    });
}
