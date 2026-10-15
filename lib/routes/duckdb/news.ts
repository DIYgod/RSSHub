import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news',
    categories: ['programming'],
    example: '/duckdb/news',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '新闻',
    maintainers: ['mocusez'],
    handler,
};

async function handler() {
    const baseUrl = 'https://duckdb.org/news/';
    const { data: response } = await got(baseUrl);
    const $ = load(response);

    const list = $('.postpreview')
        .toArray()
        .map((item): DataItem & { link: string; pubDate: Date } => {
            const $item = $(item);
            return {
                title: $item.find('h3').text(),
                link: new URL($item.find('a.blocklink').attr('href')!, baseUrl).href,
                pubDate: timezone(parseDate($item.find('.date').text(), 'YYYY-MM-DD'), 0),
                author: $item.find('.author').text().trim(),
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.body);
                item.description = $('.contentwidth').find('h1, .infoline').remove().end().html();
                return item;
            }),
        { concurrency: 4 }
    );

    return {
        title: 'DuckDB News',
        link: baseUrl,
        item: items,
    };
}
