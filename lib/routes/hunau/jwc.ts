import { Route } from '@/types';
import getContent from './utils/common';

export const route: Route = {
    path: '/jwc/:category?/:page?',
    categories: ['forecast'],
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
    radar: {
        source: ['xky.hunau.edu.cn/', 'xky.hunau.edu.cntzgg_8472', 'xky.hunau.edu.cn/:category'],
        target: '/:category',
    },
    name: '教务处',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    await getContent(ctx, {
        baseHost: 'https://jwc.hunau.edu.cn',
        baseCategory: 'tzgg', // 默认：通知公告
        baseTitle: '湖南农业大学教务处',
        baseDeparment: 'jwc',
    });
}
