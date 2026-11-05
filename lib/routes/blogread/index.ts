import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/newest',
    categories: ['programming'],
    example: '/blogread/newest',
    radar: [
        {
            source: ['blogread.cn/news/newest.php'],
        },
    ],
    name: '最新文章',
    maintainers: ['fashioncj'],
    handler,
};

async function handler() {
    const url = 'https://blogread.cn/news/newest.php';
    const response = await got({
        method: 'get',
        url,
    });
    const $ = load(response.data);
    const resultItem = $('article.br-news-item')
        .toArray()
        .map((elem) => {
            const $elem = $(elem);
            const $link = $elem.find('.br-card-title a');
            const date = $elem
                .find('.br-meta span')
                .toArray()
                .map((span) => $(span).text())
                .find((text) => /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(text));
            return {
                title: $link.text(),
                description: $elem.find('.br-summary').html(),
                link: new URL($link.attr('href')!, url).href,
                author: $elem.find('.br-meta a').text(),
                pubDate: date ? timezone(parseDate(date, 'YYYY-MM-DD HH:mm'), 8) : undefined,
            };
        });
    return {
        title: '技术头条',
        link: url,
        item: resultItem,
    };
}
