// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const { baseUrl, parseList, parseItem } = require('./utils');

export default async (ctx) => {
    const columnId = ctx.req.param('columnId');

    const { data: response, url: link } = await got(`${baseUrl}/column/${columnId}`);
    const $ = load(response);

    const list = parseList($);

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => parseItem(item))));

    ctx.set('data', {
        title: $('head title').text(),
        link,
        item: items,
    });
};
