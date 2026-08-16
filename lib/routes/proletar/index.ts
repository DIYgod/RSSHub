import { load } from 'cheerio';
import type { Context } from 'hono';

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

    const list = $('.archive-item-link')
        .toArray()
        .slice(0, 15)
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: `${rootUrl}${$item.attr('href')}`,
            };
        }) as DataItem[];

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                item.author = content('.post-author').text();
                item.description = content('#content').html()!;
                item.pubDate = parseDate(detailResponse.match(/"datePublished":"(.*)","dateModified"/)[1]);

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
