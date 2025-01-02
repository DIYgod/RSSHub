import { Route } from '@/types';
import getContent from './utils/common';

export const route: Route = {
    path: '/jwc/:category?/:page?',
    categories: ['university'],
    example: '/hunau/jwc',
    parameters: { category: '页面分类，默认为 `tzgg`', page: '页码，默认为 `1`' },
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
            source: ['xky.hunau.edu.cn/', 'xky.hunau.edu.cn/tzgg_8472', 'xky.hunau.edu.cn/:category'],
            target: '/:category',
        },
    ],
    name: '教务处',
    maintainers: [],
    handler,
    url: 'xky.hunau.edu.cn/',
    description: `| 分类 | 通知公告 | 教务动态 | 其他教务通知... |
  | ---- | -------- | -------- | --------------- |
  | 参数 | tzgg     | jwds     | 对应 URL        |`,
};

async function handler(ctx) {
    await getContent(ctx, {
        baseHost: 'https://jwc.hunau.edu.cn',
        baseCategory: 'tzgg', // 默认：通知公告
        baseTitle: '湖南农业大学教务处',
        baseDeparment: 'jwc',
    });
}
