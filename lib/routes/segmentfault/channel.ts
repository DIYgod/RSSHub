import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { host, acw_sc__v2, parseList, parseItems } from './utils';

export const route: Route = {
    path: '/channel/:name',
    categories: ['programming'],
    example: '/segmentfault/channel/frontend',
    parameters: { name: '频道名称，在频道 URL 可以找到' },
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
            source: ['segmentfault.com/channel/:name'],
        },
    ],
    name: '频道',
    maintainers: ['LogicJake', 'Fatpandac'],
    handler,
};

async function handler(ctx) {
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

    return {
        title: `segmentfault - ${channelName}`,
        link,
        item: items,
    };
}
