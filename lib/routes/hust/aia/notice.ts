// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const type = ctx.req.param('type');
    const baseUrl = 'https://aia.hust.edu.cn';
    const link = `${baseUrl}/tzgg${type ? `/${type}` : ''}.htm`;
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.list li');
    const title = $('title').text();

    ctx.set('data', {
        title,
        link,
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                return {
                    title: item.find('a h2').text(),
                    description: item.find('a div').text() || title,
                    pubDate: parseDate(item.find('.date3').text(), 'DDYYYY-MM'),
                    link: new URL(item.find('a').attr('href'), link).href,
                };
            }),
    });
};
