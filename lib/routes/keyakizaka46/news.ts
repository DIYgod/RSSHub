import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news',
    categories: ['new-media'],
    example: '/keyakizaka46/news',
    name: 'Keyakizaka46 News 欅坂 46 新闻',
    maintainers: ['crispgm'],
    handler,
};

async function handler() {
    const response = await ofetch('https://www.keyakizaka46.com/s/k46o/news/list', {
        headers: {
            Referer: 'http://www.keyakizaka46.com/',
        },
    });

    const $ = load(response);

    return {
        allowEmpty: true,
        title: '欅坂46官网 NEWS',
        link: 'http://www.keyakizaka46.com/news/',
        item: $('div.keyaki-news div.box-news ul li')
            .toArray()
            .map((item) => {
                const $item = $(item);
                return {
                    title: $item.find('div.text a').text(),
                    link: $item.find('div.text a').attr('href'),
                    pubDate: timezone(parseDate($item.find('div.date').text()), 9),
                };
            }),
    };
}
