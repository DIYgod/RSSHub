import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/',
    categories: ['other'],
    example: '/glo',
    name: '环球',
    maintainers: ['snipersteve'],
    handler,
};

async function handler() {
    const url = 'https://www.glo.com.cn/insights/prespectives/';
    const res = await ofetch(url);
    const $ = load(res);
    const list = $('.news_listul li').toArray();

    const out = await Promise.all(
        list.map((item) => {
            const $item = $(item);
            const title = $item.find('a .newstit').text();
            const itemUrl = 'http://www.glo.com.cn/' + $item.find('a').attr('href');

            return cache.tryGet(itemUrl, async () => {
                const response = await ofetch(itemUrl);
                const $d = load(response);

                return {
                    title,
                    link: itemUrl,
                    description: $d('.editor_con').html(),
                };
            });
        })
    );

    return {
        title: $('title').text(),
        link: url,
        item: out,
    };
}
