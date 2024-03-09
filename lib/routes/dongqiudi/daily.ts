import { Route } from '@/types';
export const route: Route = {
    path: '/daily',
    categories: ['new-media'],
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
    url: 'www.dongqiudi.com/special/48',
    description: `:::tip
部分球队和球员可能会有两个 id, 正确 id 应该由 \`5000\` 开头.
:::`,
};

function handler(ctx) {
    ctx.redirect('/dongqiudi/special/48');
}
