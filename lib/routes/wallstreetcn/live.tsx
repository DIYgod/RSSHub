import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const titles = {
    global: '要闻',
    'a-stock': 'A股',
    'us-stock': '美股',
    'hk-stock': '港股',
    forex: '外汇',
    commodity: '商品',
    financing: '理财',
};

export const route: Route = {
    path: '/live/:category?/:score?',
    categories: ['finance'],
    example: '/wallstreetcn/live',
    parameters: { category: '快讯分类，默认`global`，见下表', score: '快讯重要度，默认`1`全部快讯，可设置为`2`只看重要的' },
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
            source: ['wallstreetcn.com/live/:category', 'wallstreetcn.com/'],
            target: '/live/:category?',
        },
    ],
    name: '实时快讯',
    maintainers: ['nczitzk'],
    handler,
    description: `| 要闻   | A 股    | 美股     | 港股     | 外汇  | 商品      | 理财      |
| ------ | ------- | -------- | -------- | ----- | --------- | --------- |
| global | a-stock | us-stock | hk-stock | forex | commodity | financing |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'global';
    const score = ctx.req.param('score') ?? 1;

    const rootUrl = 'https://wallstreetcn.com';
    const apiRootUrl = 'https://api-one.wallstcn.com';
    const currentUrl = `${rootUrl}/live/${category}`;
    const apiUrl = `${apiRootUrl}/apiv1/content/lives?channel=${category}-channel&limit=${ctx.req.query('limit') ?? 100}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.data.items
        .filter((item) => item.score >= score)
        .map((item) => ({
            link: item.uri,
            title: item.title || item.content_text,
            pubDate: parseDate(item.display_time * 1000),
            author: item.author?.display_name ?? '',
            description: renderToString(
                <>
                    {item.content ? raw(item.content) : null}
                    {item.content_more ? raw(item.content_more) : null}
                    {item.images?.length ? item.images.map((image) => <img src={image.uri} width={image.width} height={image.height} />) : null}
                </>
            ),
        }));

    return {
        title: `华尔街见闻 - 实时快讯 - ${titles[category]}`,
        link: currentUrl,
        item: items,
    };
}
