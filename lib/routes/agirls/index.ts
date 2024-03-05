// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const { baseUrl, parseArticle } = require('./utils');

export default async (ctx) => {
    const { category = '' } = ctx.req.param();
    const link = `${baseUrl}/posts${category ? `/${category}` : ''}`;
    const response = await got(link);

    const $ = load(response.data);

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
        description: $('head meta[name=description]').attr('content'),
        item: items,
        language: $('html').attr('lang'),
    });
};
