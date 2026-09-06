import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/',
    categories: ['other'],
    example: '/jtn',
    name: '金诚同达',
    maintainers: ['snipersteve'],
    handler,
};

async function handler() {
    const url = 'https://jtn.com/CN/majorbook.aspx?Lan=CN&PageUrl=majorbook&MenuID=06001';
    const oriUrl = 'https://jtn.com/CN/';
    const res = await ofetch(url);
    const $ = load(res);
    const list = $('.col-sm-9 .news_list').toArray();

    const out = await Promise.all(
        list.map((item) => {
            const $item = $(item);
            const title = $item.find('a').html() ?? '';
            const subUrl = $item.find('a').attr('href');
            const itemUrl = oriUrl + subUrl;

            return cache.tryGet(itemUrl, async () => {
                const response = await ofetch(itemUrl);
                const $d = load(response);

                return {
                    title,
                    link: itemUrl,
                    description: $d('.col-sm-9 .news_page_content').html(),
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
