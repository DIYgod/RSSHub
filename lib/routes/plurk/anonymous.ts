import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { baseUrl, getPlurk } from './utils';

export const route: Route = {
    path: '/anonymous',
    categories: ['social-media', 'popular'],
    example: '/plurk/anonymous',
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
            source: ['plurk.com/anonymous'],
        },
    ],
    name: 'Anonymous',
    maintainers: ['TonyRL'],
    handler,
    url: 'plurk.com/anonymous',
};

async function handler(ctx) {
    const { data: apiResponse } = await got(`${baseUrl}/Stats/getAnonymousPlurks`, {
        searchParams: {
            offset: 0,
            limit: ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 200,
        },
    });

    delete apiResponse.pids;
    delete apiResponse.count;

    const items = await Promise.all(Object.values(apiResponse).map((item) => getPlurk(`plurk:${item.plurk_id}`, item, 'ಠ_ಠ', cache.tryGet)));

    return {
        title: 'Anonymous - Plurk',
        image: 'https://s.plurk.com/2c1574c02566f3b06e91.png',
        link: `${baseUrl}/anonymous`,
        item: items,
    };
}
