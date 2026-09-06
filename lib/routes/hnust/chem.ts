import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/chem',
    categories: ['university'],
    example: '/hnust/chem',
    name: '化学化工学院通知',
    maintainers: ['OrbitZore'],
    handler,
};

async function handler() {
    const base = 'https://chem.hnust.edu.cn/sytzgg/';
    const link = base + 'index.htm';
    const response = await ofetch(link);
    const $ = load(response);

    const items = $('.subNewsList li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const date = $item.find('span').text();
            const title = $item.find('h3').text();

            return {
                title,
                description: title,
                pubDate: timezone(parseDate(date), 8),
                link: base + $item.find('a').attr('href'),
            };
        });

    return {
        title: '湖南科技大学化学化工学院通知',
        link,
        description: '湖南科技大学化学化工学院通知',
        image: 'https://i.loli.net/2020/03/24/EAoPzbTsBxeOdjH.jpg',
        item: items,
    };
}
