import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/research/news',
    categories: ['other'],
    example: '/cefco/research/news',
    radar: [
        {
            source: ['www.cefco.cn/research/news.html'],
        },
    ],
    name: '观点',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.cefco.cn/research/news.html',
};

async function handler() {
    const baseUrl = 'https://www.cefco.cn';
    const link = `${baseUrl}/research/news.html`;

    const response = await ofetch(link);
    const $ = load(response);

    const list = $('#ajaxList li.fixed')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('dt a');
            return {
                title: a.text().trim(),
                link: new URL(a.attr('href')!, baseUrl).href,
                description: $item.find('dd.clamp').text(),
                pubDate: timezone(parseDate($item.find('dd.time').text().trim(), 'YYYY/MM/DD'), 8),
                image: $item.find('a.imgbox img').attr('src') ? new URL($item.find('a.imgbox img').attr('src')!, baseUrl).href : undefined,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                item.description = $('.edit_con_original').html() ?? item.description;
                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        link,
        language: 'zh-CN' as const,
        image: `${baseUrl}/images/favicon.ico`,
        item: items,
    };
}
