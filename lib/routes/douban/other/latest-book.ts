// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';

const url = 'https://book.douban.com/latest';

export default async (ctx) => {
    const res = await got.get(url);
    const $ = load(res.data);
    const list = $('#content').find('li').get();
    ctx.set('data', {
        title: '豆瓣新书速递',
        link: url,
        item: list.map((item, index) => ({
            title: `${index < 20 ? '[虚构类]' : '[非虚构类]'}${$(item).find('h2').text().trim()}`,
            link: $(item).find('a').first().attr('href'),
            description: $(item).html(),
        })),
    });
};
