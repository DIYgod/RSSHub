// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const { host, acw_sc__v2, parseList, parseItems } = require('./utils');

export default async (ctx) => {
    const name = ctx.req.param('name');

    const link = `${host}/channel/${name}`;
    const { data: pageResponse } = await got(link);
    const { data: apiResponse } = await got(`${host}/gateway/articles`, {
        searchParams: {
            query: 'channel',
            slug: name,
            offset: 0,
            size: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20,
            mode: 'scrollLoad',
        },
    });

    const $ = load(pageResponse);
    const channelName = $('#leftNav > a.active').text();

    const list = parseList(apiResponse.rows);

    const acwScV2Cookie = await acw_sc__v2(list[0].link, cache.tryGet);

    const items = await Promise.all(list.map((item) => parseItems(acwScV2Cookie, item, cache.tryGet)));

    ctx.set('data', {
        title: `segmentfault - ${channelName}`,
        link,
        item: items,
    });
};
