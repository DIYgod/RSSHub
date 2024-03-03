// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

const { rootUrl, getInfo, processItems } = require('./util');

export default async (ctx) => {
    const { range = '0' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;

    const currentUrl = new URL('newsclass.aspx?tid=1001', rootUrl).href;

    const apiUrl = new URL(`m/newslist.ashx?ac=rank&tid=${range}`, rootUrl).href;

    const { data: response } = await got(apiUrl);

    const $ = load(response);

    let items = $('a')
        .toArray()
        .filter((item) => /\/(\d+)\.html?/.test($(item).prop('href')))
        .slice(0, limit)
        .map((item) => {
            item = $(item);

            const link = item.prop('href');

            return {
                title: item.text(),
                link: new URL(link, rootUrl).href,
                guid: link.match(/\/(\d+)\.html?/)[1],
            };
        });

    items = await processItems(items, cache.tryGet);

    ctx.set('data', {
        item: items,
        ...(await getInfo(currentUrl, cache.tryGet, Number.parseInt(range, 10))),
    });
};
