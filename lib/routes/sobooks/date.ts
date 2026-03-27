import type { Route } from '@/types';

import utils from './utils';

export const route: Route = {
    path: '/date/:date?',
    categories: ['reading'],
    example: '/sobooks/date/2020-11',
    parameters: { date: '日期，见例子，默认为当前年月' },
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
            source: ['sobooks.net/:category'],
            target: '/:category',
        },
    ],
    name: '归档',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const date = ctx.req.param('date') ?? `${new Date().getFullYear()}/${new Date().getMonth()}`;

    return await utils(ctx, `books/date/${date.replace('-', '/')}`);
}
