import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { acw_sc__v2, host, parseItems, parseList } from './utils';

export const route: Route = {
    path: '/user/:name',
    categories: ['programming'],
    example: '/segmentfault/user/minnanitkong',
    parameters: { name: '用户 Id，用户详情页 URL 可以找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['segmentfault.com/u/:name'],
        },
    ],
    name: '用户',
    maintainers: ['leyuuu', 'Fatpandac'],
    handler,
};

async function handler(ctx) {
    const name = ctx.req.param('name');
    const response = await ofetch(`${host}/u/${name}`);
    const $ = load(response);
    const data = JSON.parse($('#__NEXT_DATA__').text()).props.pageProps.initialState.personal.listInfo.timeline.rows;

    const list = parseList(data);
    const { author } = list[0];

    const acwScV2Cookie = await acw_sc__v2(list[0].link);

    const items = await pMap(list, (item) => parseItems(acwScV2Cookie, item), { concurrency: 3 });

    return {
        title: `segmentfault - ${author}`,
        link: `${host}/u/${name}`,
        item: items,
    };
}
