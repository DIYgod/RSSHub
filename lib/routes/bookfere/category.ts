// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const url = 'https://bookfere.com/category/' + ctx.req.param('category');
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;

    const $ = load(data);
    const list = $('main div div section');

    ctx.set('data', {
        title: $('head title').text(),
        link: url,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const date = item.find('time').attr('datetime');
                    const pubDate = parseDate(date);
                    return {
                        title: item.find('h2 a').text(),
                        link: item.find('h2 a').attr('href'),
                        pubDate,
                        description: item.find('p').text(),
                    };
                })
                .get(),
    });
};
