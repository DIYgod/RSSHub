// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const HOME_PAGE = 'http://www.jlwater.com/';

export default async (ctx) => {
    const url = `${HOME_PAGE}portal/10000013`;
    const response = await got(url);

    const data = response.data;
    const $ = load(data);
    const list = $('.list-content ul li');

    ctx.set('data', {
        title: $('head title').text(),
        link: url,
        item: list
            .map((index, item) => {
                const $item = $(item);
                const title = $item.find('a span').text();
                const link = $item.find('a').attr('href');
                const listTime = $item.find('.list-time').text();
                const pubDate = parseDate(listTime);
                return {
                    title: `${title} ${listTime}`,
                    description: '南京市停水通知',
                    link: `${HOME_PAGE}${link}`,
                    pubDate,
                };
            })
            .get(),
    });
};
