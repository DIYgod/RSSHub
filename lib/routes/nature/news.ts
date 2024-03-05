// @ts-nocheck
import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
const { baseUrl, cookieJar, getArticle } = require('./utils');

export default async (ctx) => {
    const url = `${baseUrl}/latest-news`;
    const res = await got(url, { cookieJar });
    const $ = load(res.data);

    let items = $('.c-article-item__content')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('h3').text(),
                link: baseUrl + item.find('a').attr('href'),
                pubDate: parseDate(item.find('.c-article-item__date').text()),
            };
        });

    items = await Promise.all(items.map((item) => cache.tryGet(item.link, () => getArticle(item))));

    ctx.set('data', {
        title: 'Nature | Latest News',
        description: $('meta[name=description]').attr('content'),
        link: url,
        item: items,
    });
};
