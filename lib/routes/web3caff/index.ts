import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/:path{.+}?',
    categories: ['new-media'],
    example: '/web3caff/zh/archives/category/news_zh',
    parameters: { path: '路径，默认为首页' },
    name: '发现',
    maintainers: ['nczitzk'],
    description: `路径处填写对应页面 URL 中 \`https://web3caff.com/\` 后的字段。下面是一个例子。

若订阅 [叙事 - Web3Caff](https://web3caff.com/zh/archives/category/news_zh) 则将对应页面 URL <https://web3caff.com/zh/archives/category/news_zh> 中 \`https://web3caff.com/\` 后的字段 \`zh/archives/category/news_zh\` 作为路径填入。此时路由为 [\`/web3caff/zh/archives/category/news_zh\`](https://rsshub.app/web3caff/zh/archives/category/news_zh)`,
    handler,
};

async function handler(ctx) {
    const path = ctx.req.param('path');

    const rootUrl = 'https://web3caff.com';
    const currentUrl = path ? `${rootUrl}/${path}` : rootUrl;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.list-grouped')
        .first()
        .find('.list-body')
        .slice(0, getRouteLimit(ctx, 10))
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            const a = $item.find('.list-title');

            return {
                title: a.text(),
                link: a.attr('href'),
            };
        });

    items = await pMap(
        items,
        async (item) => {
            const detail = await cache.tryGet(`web3caff:detail:v2:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);
                content('.ss-inline-share-wrapper').remove();
                const dateText = content('meta[property="article:published_time"]').attr('content');
                const date = dateText ? parseDate(dateText) : undefined;
                return {
                    description: content('.post-content').html(),
                    author: content('.author-name .author-popup').text(),
                    category: content('a[rel="category tag"]')
                        .toArray()
                        .map((tag) => content(tag).text()),
                    pubDate: date && Number.isFinite(date.getTime()) ? date : undefined,
                };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
