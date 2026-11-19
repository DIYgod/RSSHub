import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateStrict } from '@/utils/time';

const handler = async () => {
    const rootUrl = 'https:///www.wchscu.cn';
    const currentUrl = 'https://www.wchscu.cn/public/notice/recruit';
    const { data: response } = await got(currentUrl);

    const $ = load(response);
    const list = $('div#datalist div.list div.item')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            const date = parseDateStrict($item.find('span.s2').text(), 'YYYY.MM.DD');
            return {
                title: $item.find('span.s1').text(),
                pubDate: date,
                link: new URL($item.find('a').prop('href')!, rootUrl).href,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`wchscu:recruit:detail:v1:${item.link}`, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                const newLocal = $('div.xxy3 .content');
                return { description: newLocal.html() };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};

export const route: Route = {
    name: '招聘公告',
    path: '/recruit',
    example: '/wchscu/recruit',
    url: 'www.wchscu.cn',
    maintainers: ['ViggoC'],
    categories: ['other'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },

    radar: [
        {
            source: ['www.wchscu.cn/public/notice/recruit'],
        },
    ],
    handler,
};
