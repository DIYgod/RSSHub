import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/yzb',
    categories: ['university'],
    example: '/scau/yzb',
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
            source: ['yzb.scau.edu.cn/2136/list1.htm', 'yzb.scau.edu.cn/'],
        },
    ],
    name: '华农研讯',
    maintainers: ['shengmaosu'],
    handler,
    url: 'yzb.scau.edu.cn/2136/list1.htm',
};

async function handler() {
    const link = 'https://yzb.scau.edu.cn/2136/list1.htm';
    const response = await got(link);
    const $ = load(response.data);
    const items = $('.news_list > li')
        .toArray()
        .flatMap((item) => {
            const $item = $(item);
            const anchor = $item.find('.news_title a');
            const href = anchor.attr('href');
            const title = anchor.attr('title') || anchor.text();
            if (!href || !title) {
                return [];
            }
            return { title, link: new URL(href, link).href, pubDate: timezone(parseDate($item.find('.news_meta').text(), 'YYYY-MM-DD'), 8) };
        });

    const detailedItems = await pMap(
        items,
        async (item) => ({
            ...item,
            description: await cache.tryGet(`scau:article:v1:${item.link}`, async () => {
                const response = await got(item.link);
                const article = load(response.data);
                return article('.wp_articlecontent, .content-l > .detail').first().html() ?? undefined;
            }),
        }),
        { concurrency: 3 }
    );

    return {
        title: '华南农业大学研招办',
        link,
        description: '华农研讯',
        item: detailedItems,
    };
}
