import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { host, acw_sc__v2, parseList, parseItems } from './utils';

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
    const apiURL = `${host}/gateway/homepage/${name}/timeline?size=20&offset=`;

    const response = await got(apiURL);
    const data = response.data.rows;

    const list = parseList(data);
    const { author } = list[0];

    const acwScV2Cookie = await acw_sc__v2(list[0].link, cache.tryGet);

    const items = await Promise.all(list.map((item) => parseItems(acwScV2Cookie, item, cache.tryGet)));

    return {
        title: `segmentfault - ${author}`,
        link: `${host}/u/${name}`,
        item: items,
    };
}
