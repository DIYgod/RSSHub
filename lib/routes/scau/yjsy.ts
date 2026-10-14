import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/yjsy',
    categories: ['university'],
    example: '/scau/yjsy',
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
            source: ['yjsy.scau.edu.cn/208/list.htm', 'yjsy.scau.edu.cn/'],
        },
    ],
    name: '研究生院通知',
    maintainers: ['Chunssu'],
    handler,
    url: 'yjsy.scau.edu.cn/208/list.htm',
};

async function handler() {
    const link = 'https://yjsy.scau.edu.cn/208/list1.htm';
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
        title: '华南农业大学研究生院',
        link,
        description: '通知公告',
        item: detailedItems,
    };
}
