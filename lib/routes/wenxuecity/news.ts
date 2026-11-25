import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/news',
    categories: ['bbs'],
    example: '/wenxuecity/news',
    name: '焦点新闻',
    maintainers: ['nczitzk'],
    handler,
};
async function handler() {
    const rootUrl = 'https://www.wenxuecity.com';
    const currentUrl = `${rootUrl}/news/`;
    const response = await ofetch(currentUrl);
    const $ = load(response);
    const list = $('div.mainwrap div.block div.wrapper ul li a')
        .slice(0, 15)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: `${rootUrl}${$item.attr('href')}`,
            };
        });
    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`wenxuecity:news:article:${item.link}`, async () => {
                const detailResponse = await ofetch(item.link!, {
                    headers: {
                        Referer: currentUrl,
                    },
                });
                const content = load(detailResponse);
                return {
                    description: content('#articleContent').html(),
                    author: content('[itemprop=author]').text(),
                    pubDate: parseDate(content('time[itemprop="datePublished"]').text(), 8),
                };
            });
            return { ...item, description: detail.description, author: detail.author, pubDate: detail.pubDate };
        },
        { concurrency: 3 }
    );
    return {
        title: '焦点新闻 - 文学城',
        link: currentUrl,
        item: items,
    };
}
