import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/xgxy',
    categories: ['university'],
    example: '/cug/xgxy',
    features: {
        antiCrawler: true,
    },
    name: '地理与信息工程学院综合通知公告',
    maintainers: ['chunibyo-wly'],
    handler,
};

async function handler() {
    const baseUrl = 'https://xgxy.cug.edu.cn/sybk/tzgg.htm';
    const response = await ofetch(baseUrl);
    const $ = load(response);

    const items = $('.text-list ul li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('a').text(),
                link: new URL($item.find('a').attr('href')!, baseUrl).href,
                pubDate: timezone(parseDate($item.find('span').text()), 8),
            };
        });

    return {
        title: '中国地质大学(武汉)地理与信息工程学院 - 综合通知公告',
        link: baseUrl,
        item: items,
    };
}
