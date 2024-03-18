import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { baseUrl, getPlurk } from './utils';

export const route: Route = {
    path: '/hotlinks',
    categories: ['social-media'],
    example: '/plurk/hotlinks',
    parameters: {},
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
            source: ['plurk.com/hotlinks'],
        },
    ],
    name: 'Hotlinks',
    maintainers: ['TonyRL'],
    handler,
    url: 'plurk.com/hotlinks',
};

async function handler(ctx) {
    const { data: apiResponse } = await got(`${baseUrl}/hotlinks/getLinks`, {
        searchParams: {
            offset: 0,
            count: ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 30,
        },
    });

    const items = await Promise.all(apiResponse.map((item) => getPlurk(item.link_url.startsWith('https://www.plurk.com/p/') ? item.link_url : `plurk:${item.link_url}`, item, null, cache.tryGet)));

    return {
        title: `Hot Links - Plurk`,
        image: 'https://s.plurk.com/2c1574c02566f3b06e91.png',
        link: `${baseUrl}/hotlinks`,
        item: items,
    };
}
