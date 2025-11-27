import { load } from 'cheerio';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { baseUrl, fetchFriends, getPlurk } from './utils';

export const route: Route = {
    path: '/user/:user',
    categories: ['social-media'],
    view: ViewType.SocialMedia,
    example: '/plurk/user/plurkoffice',
    parameters: { user: 'User ID, can be found in URL' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'User',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
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

    return {
        title: $('head title').text(),
        description: $('meta[property=og:description]').attr('content'),
        image: $('meta[property=og:image]').attr('content') || $('meta[name=msapplication-TileImage]').attr('content'),
        link: `${baseUrl}/${user}`,
        item: items,
    };
}
