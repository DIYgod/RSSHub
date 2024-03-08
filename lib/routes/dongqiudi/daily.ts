import { Route } from '@/types';
export const route: Route = {
    path: '/daily',
    categories: ['traditional-media'],
    example: '/dongqiudi/daily',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['www.dongqiudi.com/special/48'],
    },
    name: '早报',
    maintainers: ['HenryQW'],
    handler,
};

function handler(ctx) {
    ctx.redirect('/dongqiudi/special/48');
}
