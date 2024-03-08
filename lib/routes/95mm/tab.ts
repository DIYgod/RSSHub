import { Route } from '@/types';
import { rootUrl, ProcessItems } from './utils';

export const route: Route = {
    path: '/tab/:tab?',
    categories: ['anime'],
    example: '/95mm/tab/热门',
    parameters: { tab: '分类，见下表，默认为最新' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['95mm.org/'],
    },
    name: '分类',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const tab = ctx.req.param('tab') ?? '最新';

    const currentUrl = `${rootUrl}/home-ajax/index.html?tabcid=${tab}&page=1`;

    ctx.set('data', await ProcessItems(ctx, tab, currentUrl));
}
