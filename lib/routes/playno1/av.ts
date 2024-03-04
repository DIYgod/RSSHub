// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const { cookieJar, processArticle } = require('./utils');
const baseUrl = 'http://www.playno1.com';

export default async (ctx) => {
    const { catid = '78' } = ctx.req.param();
    const url = `${baseUrl}/portal.php?mod=list&catid=${catid}`;
    const response = await got(url, {
        cookieJar,
    });
    const $ = load(response.data);

    let items = $('.fire_float')
        .toArray()
        .filter((i) => $(i).text().length)
        .map((item) => {
            item = $(item);
            return {
                title: item.find('h3 a').attr('title'),
                link: item.find('h3 a').attr('href'),
                pubDate: timezone(parseDate(item.find('.fire_left').text()), 8),
                author: item
                    .find('.fire_right')
                    .text()
                    .match(/作者：(.*)\s*\|/)[1]
                    .trim(),
            };
        });

    items = await processArticle(items, cache);

    ctx.set('data', {
        title: $('head title').text(),
        link: url,
        item: items,
        language: 'zh-TW',
    });
};
