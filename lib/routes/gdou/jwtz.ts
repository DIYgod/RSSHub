import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/gdou/jwc',
    radar: [
        {
            source: ['jwc.gdou.edu.cn/jwdt/jwtz.htm'],
        },
    ],
    name: '教务通知',
    maintainers: ['Xiaotouming'],
    handler,
    url: 'jwc.gdou.edu.cn/jwdt/jwtz.htm',
};

async function handler() {
    const link = 'https://jwc.gdou.edu.cn/jwdt/jwtz.htm';
    const response = await ofetch(link);
    const $ = load(response);

    const list = $('li[id^="line_u8_"] a')
        .slice(0, 10)
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('em').text(),
                link: new URL($item.attr('href')!, link).href,
                pubDate: timezone(parseDate($item.find('span').text(), 'YYYY-MM-DD'), 8),
                author: '教务部',
            };
        }) as DataItem[];

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);
                item.description = $('.v_news_content').html();
                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        link,
        item: items,
    };
}
