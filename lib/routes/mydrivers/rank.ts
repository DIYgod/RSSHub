import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import got from '@/utils/got';

import { getInfo, processItems, rootUrl } from './util';

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
    if (!['0', '1', '2'].includes(range)) {
        throw new InvalidParameterError('Invalid ranking range. Use 0 for the last 24 hours, 1 for this week, or 2 for this month.');
    }
    const requestedLimit = Number(ctx.req.query('limit'));
    const limit = Number.isSafeInteger(requestedLimit) && requestedLimit > 0 ? requestedLimit : 10;

    const currentUrl = new URL('newsclass.aspx?tid=1001', rootUrl).href;

    const apiUrl = new URL(`m/newslist.ashx?ac=rank&tid=${range}`, rootUrl).href;

    const { data: response } = await got(apiUrl);

    const $ = load(response);

    let items = $('.news_title a')
        .toArray()
        .filter((item) => /\/\d+\.html?/.test($(item).prop('href')!))
        .slice(0, limit)
        .map((item) => {
            const $item = $(item);

            const link = $item.prop('href');

            return {
                title: $item.text(),
                link: new URL(link!, rootUrl).href,
                guid: link!.match(/\/(\d+)\.html?/)![1],
            };
        });

    items = await processItems(items);

    return {
        item: items,
        ...(await getInfo(currentUrl, Number(range))),
    };
}
