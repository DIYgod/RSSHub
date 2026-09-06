import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/',
    categories: ['other'],
    example: '/allbrightlaw',
    name: '锦天城',
    maintainers: ['snipersteve'],
    handler,
};

async function handler() {
    const url = 'https://www.allbrightlaw.com/CN/10475.aspx';
    const oriUrl = 'https://www.allbrightlaw.com';
    const res = await ofetch(url);
    const $ = load(res);
    const list = $('.news_list_img ul li').toArray();

    const out = await Promise.all(
        list.map((item) => {
            const $item = $(item);
            const title = $item.find('.news_txt h2').html() ?? '';
            const subUrl = $item.find('a').attr('href');
            const itemUrl = oriUrl + subUrl;
            const pubDate = timezone(parseDate(`${$item.find('.news_data span').text()}-${$item.find('.news_data p').text()}`), 8);

            return cache.tryGet(itemUrl, async () => {
                const response = await ofetch(itemUrl);
                const $d = load(response);

                return {
                    title,
                    link: itemUrl,
                    description: $d('.news_content_box .news_content').html(),
                    pubDate,
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
