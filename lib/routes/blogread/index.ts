import { Route } from '@/types';
import got from '@/utils/got';
import * as cheerio from 'cheerio';

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
    const $ = cheerio.load(response.data);
    const resultItem = $('.media')
        .map((index, elem) => {
            elem = $(elem);
            const $link = elem.find('dt a');
            return {
                title: $link.text(),
                description: elem.find('dd').eq(0).text(),
                link: $link.attr('href'),
                author: elem.find('.small a').eq(0).text(),
                pubDate: elem.find('dd').eq(1).text().split('\n')[2],
            };
        })
        .get();

    return {
        title: '技术头条',
        link: url,
        item: resultItem,
    };
}
