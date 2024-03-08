import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { baseUrl, parseList, parseItem } from './utils';

export const route: Route = {
    path: '/column/:columnId',
    categories: ['reading'],
    example: '/indienova/column/52',
    parameters: { columnId: '专题 ID，可在 URL中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['indienova.com/column/:columnId'],
    },
    name: '专题',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const columnId = ctx.req.param('columnId');

    const { data: response, url: link } = await got(`${baseUrl}/column/${columnId}`);
    const $ = load(response);

    const list = parseList($);

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => parseItem(item))));

    return {
        title: $('head title').text(),
        link,
        item: items,
    };
}
