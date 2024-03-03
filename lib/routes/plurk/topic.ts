// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const { baseUrl, fetchFriends, getPlurk } = require('./utils');

export default async (ctx) => {
    const topic = ctx.req.param('topic');
    const { data: pageResponse } = await got(`${baseUrl}/topic/${topic}`);
    const { data: apiResponse } = await got(`${baseUrl}/topic/getPlurks`, {
        searchParams: {
            topic,
            offset: 0,
            limit: ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 30,
        },
    });

    const $ = load(pageResponse);

    delete apiResponse.pids;
    delete apiResponse.count;

    const userIds = Object.values(apiResponse).map((item) => item.user_id);
    const names = await fetchFriends(userIds);

    const items = await Promise.all(Object.values(apiResponse).map((item) => getPlurk(`plurk:${item.plurk_id}`, item, names[item.user_id].display_name, cache.tryGet)));

    ctx.set('data', {
        title: $('head title').text(),
        description: $('meta[property=og:description]').attr('content'),
        image: $('meta[property=og:image]').attr('content') || $('meta[name=msapplication-TileImage]').attr('content'),
        link: `${baseUrl}/topic/${topic}`,
        item: items,
    });
};
