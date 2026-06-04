import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news',
    name: '公告',
    url: 'www.j-test.com',
    maintainers: ['kuhahku'],
    example: '/j-test/news',
    parameters: {},
    categories: ['study'],
    features: {
        supportRadar: true,
    },
    radar: [
        {
            source: ['www.j-test.com'],
            target: '/news',
        },
    ],
    handler,
    description: '',
};

async function handler() {
    const baseUrl = 'http://www.j-test.com';
    const response = await ofetch(baseUrl);
    const $ = load(response);

    const list = $('#content1 > .center > .col_box1 > .col_body1 > ul > li')
        .toArray()
        .map((item) => {
            const [title, date] = $(item).text().trim().replaceAll(']', '').split(' [');
            const link = new URL($(item).children('a').attr('href')!, baseUrl).href;
            const pubDate = timezone(parseDate(date), +8);
            return {
                title,
                link,
                pubDate,
                description: '',
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                item.description = $('.content > table').html() ?? '';
                return item;
            })
        )
    );

    return {
        title: '实用日本语鉴定考试（J.TEST）公告',
        link: baseUrl,
        item: items,
    };
}
