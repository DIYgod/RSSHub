import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/',
    categories: ['other'],
    example: '/haiwen-law',
    radar: [
        {
            source: ['www.haiwen-law.com/35'],
        },
    ],
    name: '研究文章',
    maintainers: ['snipersteve'],
    handler,
    url: 'www.haiwen-law.com/35/',
};

async function handler() {
    const baseUrl = 'http://www.haiwen-law.com';
    const link = `${baseUrl}/35/`;

    const response = await ofetch(link);
    const $ = load(response);

    const list = $('.xwzx_section ul li a')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            return {
                title: $item.find('.tit').text(),
                link: new URL($item.attr('href')!, baseUrl).href,
                pubDate: timezone(parseDate($item.find('.date').text(), 'YYYY-MM-DD'), 8),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                item.description = $('.yjwzwz_section .text1').html()?.trim();
                item.author = $('.wordsbox .zz span')
                    .toArray()
                    .map((e) => $(e).text().trim())
                    .join(', ');
                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        link,
        item: out,
    };
}
