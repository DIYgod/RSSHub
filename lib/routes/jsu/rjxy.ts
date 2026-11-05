import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { getPageItemAndDate } from './utils';

export const route: Route = {
    path: '/rjxy',
    categories: ['university'],
    example: '/jsu/rjxy',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '计算机科学与工程学院 - 通知公告',
    maintainers: ['wenjia03'],
    handler,
};

async function handler() {
    const baseUrl = 'https://rjxy.jsu.edu.cn/';

    const response = await got({
        method: 'get',
        url: 'https://rjxy.jsu.edu.cn/index/tzgg1.htm',
    });

    const $ = load(response.data);
    const list = $('body > div.list-box > div > ul > li').toArray();
    const out = await pMap(
        list,
        (item) => {
            const $item = $(item);
            const link = new URL($item.find('a').attr('href')!, baseUrl).href;
            return cache.tryGet(link, async () => {
                const category = '通知公告';
                const description = await getPageItemAndDate('#vsb_content', link, 'body > form > div > h1', 'body > form > div > div.label', (date) => date.split('  点击：', 1)[0]);
                const pubDate = parseDate(description.date, 'YYYY年MM月DD日 HH:mm');
                return {
                    title: description.title,
                    link,
                    pubDate,
                    description: description.pageInfo,
                    category,
                };
            });
        },
        { concurrency: 3 }
    );

    return {
        title: '吉首大学计算机科学与工程学院 - 通知公告',
        link: 'https://rjxy.jsu.edu.cn/index/tzgg1.htm',
        description: '吉首大学计算机科学与工程学院 - 通知公告',
        item: out,
    };
}
