import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

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
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 10)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            const a = $item.find('.list-title');

            return {
                title: a.text(),
                link: a.attr('href'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('.ss-inline-share-wrapper').remove();

                item.description = content('.post-content').html();
                item.author = content('.author-name .author-popup').text();
                item.category = content('a[rel="category tag"]')
                    .toArray()
                    .map((tag) => $(tag).text());
                item.pubDate = parseDate(content('meta[property="article:published_time"]').attr('content')!);

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
