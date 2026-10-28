import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';

import { getPage, renderPostDetail, rootUrl } from './util';

export const route: Route = {
    path: '/blog/:id',
    categories: ['finance'],
    example: '/taoguba/blog/252069',
    parameters: { id: '博客 id，可在对应博客页中找到' },
    features: {
        requireConfig: [
            {
                name: 'TAOGUBA_COOKIE',
                optional: true,
                description: 'Your own www.tgb.cn Cookie for articles that require login. Anonymous excerpts remain available without it.',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['tgb.cn/blog/:id', 'tgb.cn/'],
        },
    ],
    name: '用户博客',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const currentUrl = `${rootUrl}/blog/${id}`;

    const response = await getPage(currentUrl);

    const $ = load(response.data);
    const author = $('meta[property="og:author"]').attr('content');

    let items = $('.tittle_data')
        .slice(0, getRouteLimit(ctx, 50))
        .toArray()
        .map((item) => {
            const $item = $(item);

            const a = $item.find('a').first();

            const href = a.attr('href');
            if (!href) {
                return;
            }
            return {
                title: a.attr('title') || a.text(),
                link: new URL(href, rootUrl).href,
                author,
            };
        })
        .filter((item) => item !== undefined);

    items = await pMap(items, renderPostDetail, { concurrency: 3 });

    return {
        title: `淘股吧 - ${author}`,
        description: $('meta[http-equiv="description"]').attr('content'),
        image: $('meta[property="og:image"]').attr('content'),
        link: currentUrl,
        item: items,
    };
}
