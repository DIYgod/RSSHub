import { load } from 'cheerio';
import pMap from 'p-map';

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
    const res = await ofetch(url);
    const $ = load(res);
    const list = $('.col-sm-9 .news_list').toArray();

    const out = await pMap(
        list,
        async (item) => {
            const $item = $(item);
            const title = $item.find('a').text();
            const subUrl = $item.find('a').attr('href');
            const itemUrl = new URL(subUrl!, url).href;

            return {
                title,
                link: itemUrl,
                description: await cache.tryGet(`jtn:article:${itemUrl}`, async () => {
                    const response = await ofetch(itemUrl);
                    const $d = load(response);
                    return $d('.col-sm-9 .news_page_content').html();
                }),
            };
        },
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: url,
        item: out,
    };
}
