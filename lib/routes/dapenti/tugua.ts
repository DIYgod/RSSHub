import { Route } from '@/types';
import utils from './utils';

export const route: Route = {
    path: '/tugua',
    categories: ['picture'],
    example: '/dapenti/tugua',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '图卦',
    maintainers: ['tgly307'],
    handler,
};

async function handler(ctx) {
    ctx.set('data', await utils.parseFeed({ subjectid: 70 }));
}
