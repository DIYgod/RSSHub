import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

import { rootUrl, getInfo, processItems } from './util';

export const route: Route = {
    path: '/rank/:range?',
    categories: ['new-media'],
    example: '/mydrivers/rank',
    parameters: { range: '时间范围，见下表，默认为24小时最热' },
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
            source: ['m.mydrivers.com/newsclass.aspx'],
            target: '/rank',
        },
    ],
    name: '排行',
    maintainers: ['nczitzk'],
    handler,
    url: 'm.mydrivers.com/newsclass.aspx',
    description: `| 24 小时最热 | 本周最热 | 本月最热 |
| ----------- | -------- | -------- |
| 0           | 1        | 2        |`,
};

async function handler(ctx) {
    const { range = '0' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;

    const currentUrl = new URL('newsclass.aspx?tid=1001', rootUrl).href;

    const apiUrl = new URL(`m/newslist.ashx?ac=rank&tid=${range}`, rootUrl).href;

    const { data: response } = await got(apiUrl);

    const $ = load(response);

    let items = $('a')
        .toArray()
        .filter((item) => /\/(\d+)\.html?/.test($(item).prop('href')))
        .slice(0, limit)
        .map((item) => {
            item = $(item);

            const link = item.prop('href');

            return {
                title: item.text(),
                link: new URL(link, rootUrl).href,
                guid: link.match(/\/(\d+)\.html?/)[1],
            };
        });

    items = await processItems(items, cache.tryGet);

    return {
        item: items,
        ...(await getInfo(currentUrl, cache.tryGet, Number.parseInt(range, 10))),
    };
}
