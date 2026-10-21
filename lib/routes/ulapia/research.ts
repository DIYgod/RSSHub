import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

const rootUrl = 'http://www.ulapia.com';
const researchList = ['stock_research', 'industry_research', 'strategy_research', 'macro_research', 'ipo_research'];
export const route: Route = {
    path: '/research/latest',
    categories: ['finance'],
    example: '/ulapia/research/latest',
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
            source: ['www.ulapia.com/'],
        },
    ],
    name: '最新研报',
    maintainers: ['Fatpandac'],
    handler,
    url: 'www.ulapia.com/',
};
async function handler(ctx: Context) {
    const items = await pMap(
        researchList,
        async (item) => {
            const url = `${rootUrl}/reports/${item}`;
            const response = await got.get(url);
            const $ = load(response.data);
            const items = $('div.row > div.col-md-6')
                .filter((_, item) => !!($(item).find('img').attr('src') && $(item).find('h5.mb-1 > a').attr('href')))
                .slice(0, getRouteLimit(ctx, 6))
                .toArray()
                .map((item) => {
                    const date = $(item).find('div.mb-0.text-muted').last().text().split(':', 2)[1]?.trim() ?? '';
                    const pubDate = parseDate(date, 'YYYY-MM-DD', true);
                    return {
                        title: `${$(item).find('strong').text()}  ${$(item).find('h5.mb-1').text()}`,
                        author: $(item).find('div.col.p-8.d-flex.px-3.py-3.flex-column.position-static > div:nth-child(4) > span:nth-child(2)').text(),
                        link: $(item).find('h5.mb-1 > a').attr('href'),
                        description: `<img src="${$(item).find('img').attr('src')!.split('!', 1)[0]}">`,
                        pubDate: Number.isNaN(pubDate.getTime()) ? undefined : timezone(pubDate, 8),
                    };
                });
            return items;
        },
        { concurrency: 3 }
    );
    return {
        title: 'Ulapia - 最新研报',
        link: rootUrl,
        item: items.flat(),
    };
}
