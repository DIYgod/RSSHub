import { Route } from '@/types';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news',
    categories: ['new-media'],
    example: '/vbdata/news/',
    url: 'www.vbdata.cn/v2',
    name: '最新资讯',
    maintainers: ['p3psi-boo'],
    handler,
};

async function handler() {
    const baseUrl = 'https://www.vbdata.cn/v2';
    const response = await ofetch(baseUrl);

    const $ = load(response);
    const list = $('ul.special > li')
        .toArray()
        .map((_, item) => {
            const $item = $(item).find('.spc_cnt');
            const $link = $item.find('a').first();

            return {
                title: $link.text().trim(),
                link: new URL($link.attr('href') || '', baseUrl).href,
            };
        })
        .filter((item) => item.title && item.title !== '');

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);

                const $ = load(response);
                const cardInfo = $('.card-info');
                item.description = $('.content').html();
                item.pubDate = parseDate(cardInfo.find('.spa2').text());
                item.author = cardInfo.find('.spa1').text();
                return item;
            })
        )
    );

    return {
        title: '动脉网 - 最新资讯',
        link: baseUrl,
        item: items,
    };
}
