import type { Route } from '@/types';

import { processZxfkItems } from './util';

export const route: Route = {
    path: '/safe/complaint/:site?',
    categories: ['government'],
    example: '/gov/safe/complaint/beijing',
    parameters: { site: '站点，见上表，默认为 beijing' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '投诉建议',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const { site = 'beijing' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 5;

    return await processZxfkItems(site, 'tsjy', limit);
}
