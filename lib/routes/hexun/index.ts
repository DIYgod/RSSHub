import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
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
        .map((item): DataItem & { link: string } => {
            const element = $(item);
            const a = element.find('a');

            const link = a.attr('href')?.replace('http://', 'https://') || '';
            const title = a.text();

            return {
                title,
                link,
            };
        });

    const items = await pMap(
        list,
        async (item: (typeof list)[number]) => ({
            ...item,
            ...(await cache.tryGet(item.link, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                    responseType: 'arrayBuffer',
                });

                const $ = load(decoder.decode(response.data));

                const published = $('meta[property="bytedance:published_time"], meta[name="bytedance:published_time"]').attr('content');
                return {
                    description: $('.art_contextBox').html(),
                    pubDate: published ? parseDate(published) : undefined,
                };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: '和讯创投 - 创投行业新闻',
        link: baseUrl,
        item: items,
    };
}
