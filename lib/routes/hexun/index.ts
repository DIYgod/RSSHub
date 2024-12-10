import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const decoder = new TextDecoder('gbk');

export const route: Route = {
    path: '/pe/news',
    categories: ['new-media'],
    example: '/hexun/pe/news',
    url: 'https://www.hexun.com/pe/news',
    name: '和讯创投 - 创投行业新闻',
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

            const link = a.attr('href') || '';
            const title = a.text() || '';
            const dateText = link.split('/')[3];
            const pubDate = dateText ? parseDate(dateText, 'YYYY-MM-DD') : null;

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
