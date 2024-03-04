// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const { baseUrl, fetchFriends, getPlurk } = require('./utils');

export default async (ctx) => {
    const user = ctx.req.param('user');
    const { data: pageResponse } = await got(`${baseUrl}/${user}`);

    const $ = load(pageResponse);

    const publicPlurks = JSON.parse(
        $('body script[type]')
            .text()
            .match(/PUBLIC_PLURKS = (.*);\nPINNED_PLURK/)[1]
            .replaceAll(/new Date\((.*?)\)/g, '$1')
            .replaceAll('null', '""')
    );

    const userIds = publicPlurks.map((item) => item.user_id);
    const names = await fetchFriends(userIds);

    const items = await Promise.all(publicPlurks.map((item) => getPlurk(`plurk:${item.plurk_id}`, item, names[item.user_id].display_name, cache.tryGet)));

    ctx.set('data', {
        title: $('head title').text(),
        description: $('meta[property=og:description]').attr('content'),
        image: $('meta[property=og:image]').attr('content') || $('meta[name=msapplication-TileImage]').attr('content'),
        link: `${baseUrl}/${user}`,
        item: items,
    });
};
