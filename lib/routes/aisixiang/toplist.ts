// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const { rootUrl, ossUrl, ProcessFeed } = require('./utils');

export default async (ctx) => {
    const { id = '1', period = '1' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const currentUrl = new URL(`toplist${id ? `?id=${id}${id === '1' ? `&period=${period}` : ''}` : ''}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const title = `${$('a.hl').text() || ''}${$('title').text().split('_')[0]}`;

    const items = $('div.tops_list')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('div.tips a');

            return {
                title: a.text(),
                link: new URL(a.prop('href'), rootUrl).href,
                author: item.find('div.name').text(),
                pubDate: parseDate(item.find('div.times').text()),
            };
        });

    ctx.set('data', {
        item: await ProcessFeed(limit, cache.tryGet, items),
        title: `爱思想 - ${title}`,
        link: currentUrl,
        language: 'zh-cn',
        image: new URL('images/logo_toplist.jpg', ossUrl).href,
        subtitle: title,
    });
};
