import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:caty?',
    categories: ['new-media'],
    example: '/daodu',
    parameters: { caty: '分類，默認為全部' },
    name: '分類',
    maintainers: ['nczitzk'],
    description: `| 全部 | 文章    | Podcast |
| ---- | ------- | ------- |
| all  | article | podcast |`,
    handler,
};

async function handler(ctx: Context) {
    const { caty = 'all' } = ctx.req.param();

    const rootUrl = 'https://daodu.tech';
    const currentUrl = `${rootUrl}${caty === 'all' ? '' : `/archive_${caty}`}`;

    const response = await ofetch(currentUrl);
    const $ = load(response);

    const list = $('h2[itemprop="headline"] a, .post-header .archive__article__title a')
        .toArray()
        .slice(0, 15)
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: new URL($item.attr('href')!.split('%3F', 1)[0], rootUrl).href,
            };
        }) as DataItem[];

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                content('.member-only').remove();

                item.description = content('.post-entry-text').html();
                item.pubDate = parseDate(content('meta[property="article:published_time"]').attr('content')!);

                return item;
            })
        )
    );

    return {
        title: $('title').text().replace('一覽表', ''),
        link: currentUrl,
        item: items,
    };
}
