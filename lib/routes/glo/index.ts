import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

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
        list.map(async (item) => {
            const $item = $(item);
            const title = $item.find('a .newstit').text();
            const itemUrl = 'http://www.glo.com.cn/' + $item.find('a').attr('href');

            const description = await cache.tryGet(`glo:${itemUrl}:body`, async () => {
                const response = await ofetch(itemUrl);
                const $d = load(response);
                return $d('.editor_con').html();
            });
            const year = $item.find('.newstime span').text();
            const day = $item.find('.newstime i').text();
            const pubDate = parseDate(`${year}/${day}`, 'YYYY/MM/DD', 8);
            const author = $item
                .find('.hqpl_author')
                .text()
                .replace(/^作者：\s*/, '');
            return { title, link: itemUrl, description, pubDate, author };
        })
    );

    return {
        title: $('title').text(),
        link: url,
        item: out,
    };
}
