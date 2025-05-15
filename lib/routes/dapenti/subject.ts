import { Route } from '@/types';
import utils from './utils';

export const route: Route = {
    path: '/subject/:id',
    categories: ['picture'],
    example: '/dapenti/subject/184',
    parameters: { id: '主题 id' },
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
