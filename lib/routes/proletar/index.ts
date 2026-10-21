import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:type?/:id?',
    categories: ['new-media'],
    example: '/proletar',
    parameters: { type: '类型，`categories` 分类或 `tags` 标签，默认为全部文章', id: '分类见下表，标签名参见 [所有标签](https://review.proletar.ink/tags)' },
    name: '分类 / 标签',
    maintainers: ['nczitzk'],
    description: `| 全部文章 | 中流击水 | 革命文艺 | 当代中国 | 理论视野 | 国际观察 | 史海沉钩 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
|          | 中流击水 | 革命文艺 | 当代中国 | 理论视野 | 国际观察 | 史海沉钩 |`,
    handler,
};

async function handler(ctx: Context) {
    const { type = '', id = '' } = ctx.req.param();

    const rootUrl = 'https://review.proletar.ink';
    const currentUrl = `${rootUrl}/${type === '' && id === '' ? 'posts' : `${type}/${id}`}/`;
    const response = await ofetch(currentUrl);

    const $ = load(response);

    const list: DataItem[] = $('.archive-item-link')
        .slice(0, 15)
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: `${rootUrl}${$item.attr('href')}`,
            };
        });

    const items = await pMap(
        list,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`proletar:article:v2:${item.link}`, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                const metadata = content('script[type="application/ld+json"]')
                    .toArray()
                    .flatMap((script) => {
                        const data = JSON.parse(content(script).text());
                        return Array.isArray(data) ? data : (data['@graph'] ?? [data]);
                    })
                    .find((entry) => entry['@type'] === 'BlogPosting');
                return {
                    author: content('.post-author').text(),
                    description: content('#content').html()!,
                    pubDate: parseSourceDate(metadata?.datePublished),
                    updated: parseSourceDate(metadata?.dateModified),
                };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}

function parseSourceDate(value?: string): Date | undefined {
    if (typeof value !== 'string' || !value) {
        return;
    }
    const date = parseDate(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
}
