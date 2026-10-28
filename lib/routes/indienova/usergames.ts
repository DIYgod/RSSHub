import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/usergames',
    categories: ['game'],
    example: '/indienova/usergames',
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
            source: ['indienova.com/usergames', 'indienova.com/'],
        },
    ],
    name: '会员开发游戏库',
    maintainers: ['TonyRL'],
    handler,
    url: 'indienova.com/usergames',
};

async function handler() {
    const baseUrl = 'https://indienova.com';

    const { data: response, url: link } = await got(`${baseUrl}/usergames`);
    const $ = load(response);

    const list = $('.steam-game')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.find('h3').attr('title')!,
                link: new URL($item.find('a').attr('href')!, baseUrl).href,
                author: $item.find('span').text(),
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                item.description = [$('.cover-image').prop('outerHTML'), $('.tab-container').html(), $('.swiper-wrapper').prop('outerHTML'), $('.postcontent').html()].join('');
                const releaseDate = $('.gamedb-release').text().replaceAll(/[()]/g, '').trim();
                item.pubDate = releaseDate ? timezone(parseDate(releaseDate), 8) : undefined;

                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: $('head title').text(),
        link,
        item: items,
    };
}
