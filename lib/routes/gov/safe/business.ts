import type { Route } from '@/types';

import { processZxfkItems } from './util';

export const route: Route = {
    path: '/safe/business/:site?',
    categories: ['government'],
    example: '/gov/safe/business/beijing',
    parameters: { site: '站点，见上表，默认为 beijing' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '业务咨询',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const { site = 'beijing' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 3;

    return await processZxfkItems(site, 'ywzx', limit);
}
