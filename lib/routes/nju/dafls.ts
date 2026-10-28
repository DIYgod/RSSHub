import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/dafls',
    categories: ['university'],
    example: '/nju/dafls',
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
            source: ['dafls.nju.edu.cn/13167/list.html', 'dafls.nju.edu.cn/'],
        },
    ],
    name: '大学外语部',
    maintainers: ['ret-1'],
    handler,
    url: 'dafls.nju.edu.cn/13167/list.html',
};

const url = 'https://dafls.nju.edu.cn/13167/list.htm';

async function handler() {
    const response = await got(url);
    const $ = load(response.data);
    const items = $('.news_list li.news')
        .toArray()
        .flatMap((element) => {
            const $item = $(element);
            const href = $item.find('a').attr('href');
            if (!href) {
                return [];
            }
            return {
                title: $item.find('.news_title').text(),
                link: new URL(href, url).href,
                pubDate: timezone(parseDate($item.find('.news_meta').text(), 'YYYY-MM-DD'), 8),
                category: 'tzgg',
            };
        });

    return {
        title: '大外部-通知公告',
        link: url,
        item: items,
    };
}
