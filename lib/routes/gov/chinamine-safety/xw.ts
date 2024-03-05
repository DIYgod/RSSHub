// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

const { rootUrl, processItems, fetchData } = require('./util');

export default async (ctx) => {
    const { category = 'yjglbyw' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const currentUrl = new URL(`xw/${category.endsWith('/') ? category : `${category}/`}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('div.center_display_right table tbody tr td a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: new URL(item.prop('href'), currentUrl).href,
                pubDate: timezone(parseDate(item.parent().find('span').text()), +8),
            };
        });

    items = await processItems(items, cache.tryGet);

    ctx.set('data', {
        item: items,
        ...fetchData($, currentUrl),
    });
};
