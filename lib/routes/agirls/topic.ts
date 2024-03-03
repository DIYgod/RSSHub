// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const { baseUrl, parseArticle } = require('./utils');

export default async (ctx) => {
    const topic = ctx.req.param('topic');
    const link = `${baseUrl}/topic/${topic}`;
    const response = await got(link);

    const $ = load(response.data);
    const ldJson = JSON.parse($('script[type="application/ld+json"]').text());
    const list = $('.ag-post-item__link')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text().trim(),
                link: `${baseUrl}${item.attr('href')}`,
            };
        });

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => parseArticle(item))));

    ctx.set('data', {
        title: $('head title').text().trim(),
        link,
        description: ldJson['@graph'][0].description,
        item: items,
        language: $('html').attr('lang'),
    });
};
