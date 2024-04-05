import { Route } from '@/types';
import utils from './utils';

export const route: Route = {
    path: '/keyword/:keyword',
    categories: ['design'],
    example: '/dribbble/keyword/player',
    parameters: { keyword: 'desired keyword' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Keyword',
    maintainers: ['DIYgod', 'loganrockmore'],
    handler,
};

async function handler(ctx) {
    const keyword = ctx.req.param('keyword');
    const url = `https://dribbble.com/search/shots/recent?q=${keyword}`;

    const title = `Dribbble - keyword ${keyword}`;

    return await utils.getData(ctx, url, title);
}
