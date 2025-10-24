import { Route } from '@/types';
export const route: Route = {
    path: '/coronavirus',
    categories: ['other'],
    example: '/scmp/coronavirus',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'South China Morning Post - China coronavirus outbreak',
    maintainers: ['DIYgod'],
    handler,
};

function handler(ctx) {
    ctx.set('redirect', '/scmp/topics/coronavirus-pandemic-all-stories');
}
