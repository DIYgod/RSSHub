import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';

import { getPage, renderPostDetail, rootUrl } from './util';

export const route: Route = {
    path: '/:category?',
    categories: ['finance'],
    example: '/taoguba',
    parameters: { category: '分类，见下表，默认为社区总版' },
    features: {
        requireConfig: [
            {
                name: 'TAOGUBA_COOKIE',
                optional: true,
                description: 'Your own www.tgb.cn Cookie for articles that require login. Anonymous excerpts remain available without it.',
            },
        ],
    },
    name: '淘股论坛',
    maintainers: ['nczitzk'],
    handler,
    description: `| 淘股论坛 | 社区总版 | 精华加油 | 网友点赞 |
| -------- | -------- | -------- | -------- |
| bbs      | zongban  | jinghua  | dianzan  |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'zongban';

    const currentUrl = `${rootUrl}/${category}/`;

    const response = await getPage(currentUrl);

    const $ = load(response.data);

    let items = $('.Nbbs-tiezi-lists')
        .slice(0, getRouteLimit(ctx, 70))
        .toArray()
        .map((item) => {
            const $item = $(item);

            const a = $item.find('.middle-list-tittle a');

            const href = a.attr('href');
            if (!href) {
                return;
            }
            return {
                title: a.attr('title') || a.text(),
                link: new URL(href, rootUrl).href,
                author: $item.find('.middle-list-user a').text().trim(),
            };
        })
        .filter((item) => item !== undefined);

    items = await pMap(items, renderPostDetail, { concurrency: 3 });

    return {
        title: $('head title').text().trim().split('_', 1)[0],
        link: currentUrl,
        item: items,
    };
}
