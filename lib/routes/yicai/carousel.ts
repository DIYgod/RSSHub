import { Route } from '@/types';
import cache from '@/utils/cache';
import { rootUrl, ProcessItems, fetchFullArticles } from './utils';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

export const route: Route = {
    path: '/carousel',
    categories: ['traditional-media'],
    example: '/yicai/carousel',
    parameters: {},
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
            source: ['yicai.com/'],
        },
    ],
    name: '轮播',
    maintainers: ['nczitzk'],
    handler,
    url: 'yicai.com/',
};

async function handler(ctx) {
    const rootUrl = "https://www.yicai.com";
    const res = await ofetch(rootUrl);
    const $ = load(res);
    const items = await fetchFullArticles($("#breaknews a").toArray().map((e) => ({ link: (new URL($(e).attr("href"), rootUrl)).href, title: $(e).text() })), cache.tryGet);

    return {
        title: '第一财经 - 轮播',
        link: rootUrl,
        item: items,
    };
}
