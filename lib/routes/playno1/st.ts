// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const { cookieJar, processArticle } = require('./utils');
const baseUrl = 'http://stno1.playno1.com';

export default async (ctx) => {
    const { catid = 'all' } = ctx.req.param();
    const url = `${baseUrl}/stno1/${catid}/`;
    const response = await got(url, {
        cookieJar,
    });
    const $ = load(response.data);

    let items = $('.fallsBox')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.ftitle a').attr('title'),
                link: item.find('.ftitle a').attr('href'),
                pubDate: timezone(parseDate(item.find('.dateBox').text(), 'YYYY-MM-DD HH:mm'), 8),
                author: item.find('.dateBox span a').eq(0).text().trim(),
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
