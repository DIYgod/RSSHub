import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/',
    categories: ['government'],
    example: '/gov/mnd',
    radar: [
        {
            source: ['www.mnd.gov.tw/newslist'],
        },
    ],
    name: '即時軍事動態',
    maintainers: ['nczitzk'],
    handler,
    url: 'www.mnd.gov.tw/newslist',
};

async function handler() {
    const rootUrl = 'https://www.mnd.gov.tw';
    const link = `${rootUrl}/newslist`;

    const response = await ofetch(link);
    const $ = load(response);

    const list = $('a.news_list')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const dateSplit = $item.find('.date').text().split('.');
            dateSplit[0] = (Number.parseInt(dateSplit[0]) + 1911).toString();

            return {
                title: $item.find('.title').text(),
                link: new URL($item.attr('href')!, rootUrl).href,
                pubDate: timezone(parseDate(dateSplit.join('-')), 8),
                category: [$item.find('.category').text()],
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                item.description = content('div.maincontent').html();

                return item;
            })
        )
    );

    return {
        title: '即時軍事動態 - 中華民國國防部',
        link,
        item: items,
    };
}
