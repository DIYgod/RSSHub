import { Route } from '@/types';
export const route: Route = {
    path: '/daily',
    categories: ['other'],
    example: '/nbd/daily',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['nbd.com.cn/', 'nbd.com.cn/columns/332'],
    },
    name: '重磅原创',
    maintainers: ['yuuow'],
    handler,
};

function handler(ctx) {
    ctx.redirect('/nbd/332');
}
