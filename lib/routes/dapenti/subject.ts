import type { Route } from '@/types';

import utils, { channels } from './utils';

export const route: Route = {
    path: '/subject/:id',
    categories: ['picture'],
    example: '/dapenti/subject/184',
    parameters: {
        id: {
            description: '栏目，可在栏目页 URL 的 `channel` 参数中找到',
            options: Object.entries(channels).map(([value, label]) => ({ value, label })),
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '主题',
    maintainers: ['xyqfer'],
    handler,
};

async function handler(ctx) {
    return await utils.parseFeed({ subjectid: ctx.req.param('id') });
}
