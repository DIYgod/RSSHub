import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { baseUrl, fetchFriends, getPlurk } from './utils';

export const route: Route = {
    path: '/news/:lang?',
    categories: ['social-media'],
    example: '/plurk/news/:lang?',
    parameters: { lang: 'Language, see the table above, `en` by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['plurk.com/news'],
            target: '/news',
        },
    ],
    name: 'Plurk News',
    maintainers: ['TonyRL'],
    handler,
    url: 'plurk.com/news',
};

async function handler(ctx) {
    const { lang = 'en' } = ctx.req.param();
    const { data: apiResponse } = await got(`${baseUrl}/PlurkTop/fetchOfficialPlurks`, {
        searchParams: {
            lang,
        },
    });

    const userIds = apiResponse.map((item) => item.user_id);
    const names = await fetchFriends(userIds);

    const items = await Promise.all(apiResponse.map((item) => getPlurk(`plurk:${item.plurk_id}`, item, names[item.user_id].display_name, cache.tryGet)));

    return {
        title: 'Plurk News - Plurk',
        image: 'https://s.plurk.com/2c1574c02566f3b06e91.png',
        link: `${baseUrl}/news`,
        item: items,
    };
}
