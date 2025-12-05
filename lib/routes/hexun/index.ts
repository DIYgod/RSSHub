import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const decoder = new TextDecoder('gbk');

export const route: Route = {
    path: '/pe/news',
    categories: ['finance'],
    example: '/hexun/pe/news',
    url: 'pe.hexun.com/news/',
    name: '创投行业新闻',
    maintainers: ['p3psi-boo'],
    handler,
};

async function handler() {
    const baseUrl = 'https://pe.hexun.com/news/';

    const response = await got({
        method: 'get',
        url: baseUrl,
        responseType: 'arrayBuffer',
    });

    const $ = load(decoder.decode(response.data));

    const list = $('.listNews li')
        .toArray()
        .map((item) => {
            const element = $(item);
            const a = element.find('a');

            const link = a.attr('href')?.replace('http://', 'https://') || '';
            const title = a.text() || '';

            const timeSpan = element.find('span');
            const dateText = timeSpan.text().slice(1, timeSpan.text().length - 1);
            const pubDate = parseDate(dateText, 'MM/DD HH:mm');

            return {
                title,
                link,
                pubDate,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                    responseType: 'arrayBuffer',
                });

                const $ = load(decoder.decode(response.data));

                item.description = $('.art_contextBox').html() || '';

                return item;
            })
        )
    );

    return {
        title: '和讯创投 - 创投行业新闻',
        link: baseUrl,
        item: items,
    };
}
