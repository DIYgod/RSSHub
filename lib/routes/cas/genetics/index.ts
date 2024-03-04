// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://genetics.cas.cn';

export default async (ctx) => {
    const path = ctx.req.param('path');

    const currentUrl = `${baseUrl}/${path}/`;

    const { data: response } = await got(currentUrl);
    const $ = load(response);

    let items;

    if (path.substring(0, 3) === 'edu') {
        items = $('li.box-s.h16')
            .toArray()
            .map((item) => {
                item = $(item);
                const a = item.find('a').first();
                const date = item.find('.box-date').first();
                return {
                    title: a.text(),
                    link: new URL(a.attr('href'), currentUrl).href,
                    pubDate: parseDate(date.text(), 'YYYY-MM-DD'),
                };
            });
    } else if (path.substring(0, 4) === 'dqyd') {
        items = $('div.list-tab ul li')
            .toArray()
            .map((item) => {
                item = $(item);
                const a = item.find('a').first();
                const date = item.find('.right').first();
                return {
                    title: a.text(),
                    link: new URL(a.attr('href'), currentUrl).href,
                    pubDate: parseDate(date.text(), 'YYYY-MM-DD'),
                };
            });
    } else {
        items = $('li.row.no-gutters.py-1')
            .toArray()
            .map((item) => {
                item = $(item);
                const a = item.find('a').first();
                const date = item.find('.col-news-date').first();
                return {
                    title: a.text(),
                    link: new URL(a.attr('href'), currentUrl).href,
                    pubDate: parseDate(date.text(), 'YYYY.MM.DD'),
                };
            });
    }

    ctx.set('data', {
        title: $('head title').text(),
        link: currentUrl,
        item: items,
    });
};
