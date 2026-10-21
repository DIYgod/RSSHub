import type { Route } from '@/types';

import { utils } from './utils';

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
    name: '归档',
    maintainers: ['nczitzk'],
    handler,
};

export async function handler(ctx) {
    const { date, year, month } = ctx.req.param();
    const archiveDate = year && month ? `${year}/${month}` : (date ?? `${new Date().getFullYear()}/${new Date().getMonth() + 1}`);

    return await utils(ctx, `books/date/${archiveDate.replace('-', '/')}`);
}
