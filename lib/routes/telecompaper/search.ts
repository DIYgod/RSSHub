import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/search/:keyword?/:company?/:sort?/:period?',
    categories: ['journal'],
    example: '/telecompaper/search/Nokia',
    parameters: { keyword: 'Keyword', company: 'Company name, empty by default', sort: 'Sorting, see table below, `Date Descending` by default', period: 'Date selection, Last 12 months by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Search',
    maintainers: ['nczitzk'],
    handler,
    description: `Sorting

| Date Ascending | Date Descending |
| -------------- | --------------- |
| 1              | 2               |

Date selection

| 1 month | 3 months | 6 months | 12 months | 24 months |
| ------- | -------- | -------- | --------- | --------- |
| 1       | 3        | 6        | 12        | 24        |`,
};

async function handler(ctx) {
    const keyword = ctx.req.param('keyword') || '';
    const company = ctx.req.param('company') || '';
    const sort = ctx.req.param('sort') || '2';
    const period = ctx.req.param('period') || '12';

    const rootUrl = `https://www.telecompaper.com/search/index.aspx?search=${keyword}`;

    let response = await got({
            method: 'get',
            url: rootUrl,
        }),
        $ = load(response.data);

    response = await got({
        method: 'post',
        url: rootUrl,
        data: JSON.stringify({
            __EVENTTARGET: '',
            __EVENTARGUMENT: '',
            __VSTATE: $('#__VSTATE').attr('value'),
            __VIEWSTATE: '',
            ctl00$header$searchText: 'Search keywords',
            ctl00$header$searchTextMobile: 'Search keywords',
            ctl00$MainPlaceHolder$SearchText: keyword,
            ctl00$MainPlaceHolder$CompanyText: company,
            ctl00$MainPlaceHolder$Sort: Number.parseInt(sort),
            ctl00$MainPlaceHolder$Results: 20,
            ctl00$MainPlaceHolder$Date: 'Timeframe1',
            ctl00$MainPlaceHolder$Period: Number.parseInt(period),
            ctl00$MainPlaceHolder$txtStartDate: '',
            ctl00$MainPlaceHolder$txtEndDate: '',
            ctl00$MainPlaceHolder$chkEnglish: 'on',
            ctl00$MainPlaceHolder$Submit: 'Search',
        }),
    });
    $ = load(response.data);

    const list = $('table.details_rows tbody tr')
        .slice(0, 15)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('a');
            const date = $item.find('span.source').text().split(' | ', 1)[0];
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: date ? parseDate(`${date} GMT+1`) : undefined,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`telecompaper:detail-fields:v1:${item.link}`, async (): Promise<Partial<DataItem>> => {
                const detailResponse = await got({ method: 'get', url: item.link });
                const content = load(detailResponse.data);
                return { description: content('#pageContainer').html() };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: `Telecompaper Search - ${keyword}`,
        link: rootUrl,
        item: items,
    };
}
