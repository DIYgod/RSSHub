// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    const response = await got(`https://www.linovelib.com/novel/${ctx.req.param('id')}/catalog`);
    const $ = load(response.data);

    const meta = $('.book-meta');
    const title = meta.children().first().text();
    const author = meta.find('p > span > a').text();

    const list = $('.chapter-list');
    const items = list
        .find('li')
        .find('a')
        .filter((idx, item) => $(item).attr('href').startsWith('/novel/'))
        .map((idx, item) => ({
            title: $(item).text(),
            author,
            description: $(item).text(),
            link: `https://www.linovelib.com${$(item).attr('href')}`,
        }))
        .get();
    items.reverse();

    ctx.set('data', {
        title: `哩哔轻小说 - ${title}`,
        link: `https://www.linovelib.com/novel/${ctx.req.param('id')}/catalog`,
        description: title,
        language: 'zh',
        item: items,
    });
};
