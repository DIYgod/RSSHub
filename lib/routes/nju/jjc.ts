import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jjc',
    categories: ['university'],
    example: '/nju/jjc',
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
            source: ['jjc.nju.edu.cn/main.htm', 'jjc.nju.edu.cn/'],
        },
    ],
    name: '基建处',
    maintainers: ['ret-1'],
    handler,
    url: 'jjc.nju.edu.cn/main.htm',
};

async function handler() {
    const categoryMap = {
        cgxx: '采购信息',
        cjgg: '成交公告',
        cftb: '处罚公告',
    };

    const items = await Promise.all(
        Object.keys(categoryMap).map(async (c) => {
            const response = await got(`https://jjc.nju.edu.cn/${c}/list.htm`);

            const data = response.data;
            const $ = load(data);
            const list = $('#wp_news_w6 li.news');

            // only read first page
            return list.map((index, item) => {
                const $item = $(item);
                return {
                    title: $item.find('a').attr('title')!,
                    link: new URL($item.find('a').attr('href')!, 'https://jjc.nju.edu.cn').href,
                    pubDate: timezone(parseDate($item.find('.news_meta').text(), 'YYYY-MM-DD'), 8),
                    category: categoryMap[c],
                };
            });
        })
    );

    return {
        title: '南京大学基建处',
        link: 'https://jjc.nju.edu.cn/main.htm',
        item: [...items[0], ...items[1], ...items[2]],
    };
}
