import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDateStrict } from '@/utils/time';

export const route: Route = {
    path: '/news',
    categories: ['new-media'],
    example: '/keyakizaka46/news',
    name: 'News 新闻',
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
        title: '欅坂46官网 NEWS',
        link: 'https://www.keyakizaka46.com/s/k46o/news/list',
        item: $('div.keyaki-news div.box-news ul li')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const sourceDate = $item.find('div.date').text().trim();
                const date = sourceDate ? parseDateStrict(sourceDate, 'YYYY.MM.DD', 9) : undefined;
                return {
                    title: $item.find('div.text a').text(),
                    link: $item.find('div.text a').attr('href'),
                    pubDate: date,
                };
            }),
    };
}
