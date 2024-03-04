// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

const { rootUrl, ProcessItems } = require('./utils');

export default async (ctx) => {
    const id = ctx.req.param('id') ?? '428';

    const currentUrl = `${rootUrl}/vip/product/${id}`;
    const apiUrl = `${rootUrl}/api/ajax/getlistbypid?id=${id}&type=3&page=1&pagesize=${ctx.req.query('limit') ?? 30}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = await ProcessItems(apiUrl, cache.tryGet);

    ctx.set('data', {
        title: `第一财经VIP频道 - ${$('title').text()}`,
        link: currentUrl,
        item: items,
    });
};
