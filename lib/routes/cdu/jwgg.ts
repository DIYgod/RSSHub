import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jwgg',
    categories: ['university'],
    example: '/cdu/jwgg',
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
            source: ['jw.cdu.edu.cn/'],
        },
    ],
    name: '教务处通知公告',
    maintainers: ['uuwor'],
    handler,
    url: 'jw.cdu.edu.cn/',
};

async function handler() {
    const url = 'https://jw.cdu.edu.cn/jwgg.htm';
    const response = await got.get(url);
    const data = response.data;
    const $ = load(data);
    const list = $('.text-list li')
        .slice(0, 10)
        .toArray()
        .map((e): DataItem => {
            const element = $(e);
            const anchor = element.find('a[href]');
            const title = anchor.attr('title') || anchor.text();
            const link = new URL(anchor.attr('href')!, url).href;
            const date = element.find('.span').text();
            const pubDate = date ? timezone(parseDate(date, 'YYYY-MM-DD'), 8) : undefined;

            return {
                title,
                link,
                author: '成都大学教务处通知公告',
                pubDate,
            };
        });

    const result = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const itemReponse = await got.get(item.link);
                const data = itemReponse.data;
                const itemElement = load(data);

                item.description = itemElement('.v_news_content').html();

                return item;
            })
        )
    );

    return {
        title: '成大教务处通知公告',
        link: url,
        item: result,
    };
}
