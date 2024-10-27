import got from '@/utils/got';
import { load } from 'cheerio';

export function handler(router: (ctx) => string) {
    return async (ctx) => {
        const response = await got(router(ctx));
        const $ = load(response.body);
        const list = $('.tit-list ul li');

        return {
            title: '吉林大学物理学院',
            link: 'https://phy.jlu.edu.cn/',
            description: '吉林大学物理学院',
            item: list.toArray().map((item) => {
                const element = $(item).find('a');
                const title = element.find('.tl-top').find('h3').text().trim();
                const link = element.attr('href')!.replace('../', 'https://phy.jlu.edu.cn/');
                const date = element.find('.tl-top').find('.tl-date');
                const pubDate = date.find('span').text().replace('/', '').trim() + '-' + date.find('b').text();
                return {
                    title,
                    link,
                    pubDate: new Date(pubDate),
                };
            }),
        };
    };
}
