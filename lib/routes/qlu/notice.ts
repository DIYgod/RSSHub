import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://www.qlu.edu.cn';

export const route: Route = {
    path: '/notice',
    categories: ['university'],
    example: '/qlu/notice',
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
            source: ['qlu.edu.cn/tzggsh/list1.htm'],
        },
    ],
    name: '通知公告',
    maintainers: ['SunBK201'],
    handler,
    url: 'qlu.edu.cn/tzggsh/list1.htm',
};

async function handler() {
    const response = await got({
        method: 'get',
        url: `${host}/tzggsh/list1.htm`,
    });

    const $ = load(response.data);
    const list = $('ul.news_list.list2')
        .children()
        .toArray()
        .flatMap((item) => {
            const href = $(item).find('.news_title > a').attr('href');
            if (!href) {
                return [];
            }
            const link = new URL(href, `${host}/tzggsh/list1.htm`);
            if (!['http:', 'https:'].includes(link.protocol)) {
                return [];
            }
            return { element: item, link: link.href };
        });

    const items = await pMap(
        list,
        (item) => {
            const $item = $(item.element);
            const itemTitle = $item.find('.news_title').children().text();
            const itemDate = $item.find('.news_year').text() + $item.find('.news_days').text();
            const itemUrl = item.link;
            return cache.tryGet(itemUrl!, async () => {
                let description: string;
                if (new URL(itemUrl).origin === host) {
                    const result = await got(itemUrl);
                    const $ = load(result.data);
                    description = $('.read').html() ?? '';
                } else {
                    description = itemTitle;
                }
                return {
                    title: itemTitle,
                    link: itemUrl,
                    pubDate: timezone(parseDate(itemDate), 8),
                    description,
                };
            });
        },
        { concurrency: 3 }
    );

    return {
        title: '齐鲁工业大学 - 通知公告',
        link: `${host}/tzggsh/list1.htm`,
        description: '齐鲁工业大学 - 通知公告',
        item: items,
    };
}
