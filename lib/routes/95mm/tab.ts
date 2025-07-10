import { Route } from '@/types';
import { rootUrl, ProcessItems } from './utils';

export const route: Route = {
    path: '/tab/:tab?',
    categories: ['picture'],
    example: '/95mm/tab/热门',
    parameters: { tab: '分类，见下表，默认为最新' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['95mm.org/'],
        },
    ],
    name: '分类',
    maintainers: ['nczitzk'],
    handler,
    url: '95mm.org/',
    description: `| 最新 | 热门 | 校花 | 森系 | 清纯 | 童颜 | 嫩模 | 少女 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |`,
};

async function handler(ctx) {
    const tab = ctx.req.param('tab') ?? '最新';

    const currentUrl = `${rootUrl}/home-ajax/index.html?tabcid=${tab}&page=1`;

    return await ProcessItems(ctx, tab, currentUrl);
}
