import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import got from '@/utils/got';

import { acw_sc__v2, host, parseItems, parseList } from './utils';

export const route: Route = {
    path: '/blogs/:tag',
    categories: ['programming'],
    example: '/segmentfault/blogs/go',
    parameters: { tag: '标签名称，在 [标签](https://segmentfault.com/tags) 中可以找到' },
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
            source: ['segmentfault.com/t/:tag/blogs'],
        },
    ],
    name: '博客',
    maintainers: ['shiluanzzz'],
    handler,
};

async function handler(ctx) {
    const tag = ctx.req.param('tag');
    const response = await got(`${host}/t/${tag}/blogs`);
    const $ = load(response.data);
    const data = JSON.parse($('#__NEXT_DATA__').text()).props.pageProps.initialState.tag.tagRecord.rows;

    const list = parseList(data);

    const acwScV2Cookie = await acw_sc__v2(list[0].link);

    const items = await pMap(list, (item) => parseItems(acwScV2Cookie, item), { concurrency: 3 });

    return {
        title: `segmentfault-Blogs-${tag}`,
        link: `${host}/t/${tag}/blogs`,
        item: items,
    };
}
