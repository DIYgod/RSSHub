import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { finishArticleItem } from '@/utils/wechat-mp';

export const route: Route = {
    path: '/market',
    categories: ['other'],
    example: '/tw-nongmu/market',
    radar: [
        {
            source: ['www.tw-nongmu.com/market.html', 'www.tw-nongmu.com/'],
        },
    ],
    name: '鱼价行情',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.tw-nongmu.com/market.html',
};

async function handler() {
    const baseUrl = 'https://www.tw-nongmu.com';
    const link = `${baseUrl}/market.html`;

    const response = await ofetch(link);
    const $ = load(response);

    const list = $('.list-list li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a');
            return {
                title: a.text(),
                link: a.attr('href')!,
                pubDate: parseDate($item.find('.date').text(), 'YYYY年MM月DD日'),
            };
        });

    const items = await Promise.all(list.map((item) => finishArticleItem(item)));

    return {
        title: $('head title').text(),
        link,
        language: $('html').attr('lang') as const,
        image: `${baseUrl}/favicon.ico`,
        item: items,
    };
}
