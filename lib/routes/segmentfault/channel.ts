import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';

import { acw_sc__v2, host, parseItems, parseList } from './utils';

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
    const $ = load(pageResponse);
    const channelName = $('#leftNav > a.active').text();

    const limit = getRouteLimit(ctx, 20);
    const rows = JSON.parse($('#__NEXT_DATA__').text()).props.pageProps.initialState.blogs.articles.rows;
    const list = parseList(rows.slice(0, limit));

    const acwScV2Cookie = await acw_sc__v2(list[0].link);

    const items = await pMap(list, (item) => parseItems(acwScV2Cookie, item), { concurrency: 3 });

    return {
        title: `segmentfault - ${channelName}`,
        link,
        item: items,
    };
}
