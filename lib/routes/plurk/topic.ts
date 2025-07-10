import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { baseUrl, fetchFriends, getPlurk } from './utils';

export const route: Route = {
    path: '/topic/:topic',
    categories: ['social-media'],
    view: ViewType.SocialMedia,
    example: '/plurk/topic/standwithukraine',
    parameters: { topic: 'Topic ID, can be found in URL' },
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
            source: ['plurk.com/topic/:topic'],
        },
    ],
    name: 'Topic',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
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

    return {
        title: $('head title').text(),
        description: $('meta[property=og:description]').attr('content'),
        image: $('meta[property=og:image]').attr('content') || $('meta[name=msapplication-TileImage]').attr('content'),
        link: `${baseUrl}/topic/${topic}`,
        item: items,
    };
}
