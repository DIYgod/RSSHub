import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

export const route: Route = {
    path: '/latest-article/:sort{.+}?',
    categories: ['new-media'],
    example: '/thenewslens/latest-article',
    parameters: { sort: '排序方式，见下表，可在对应排序页 URL 中找到' },
    description: `| 最新文章 | 最多觀看 | 最多分享 | 本日      | 本週     | 本月      | 今年     | 去年         | 有史以來    |
| -------- | -------- | -------- | --------- | -------- | --------- | -------- | ------------ | ----------- |
|          | hot      | social   | hot/today | hot/week | hot/month | hot/year | hot/lastYear | hot/history |`,
    radar: [
        {
            source: ['thenewslens.com/latest-article/:sort?', 'thenewslens.com/'],
            target: '/latest-article/:sort?',
        },
    ],
    name: '最新',
    maintainers: ['nczitzk'],
    handler,
};

export async function handler(ctx) {
    const rootUrl = 'https://www.thenewslens.com';
    const currentUrl = `${rootUrl}${getSubPath(ctx) === '/' ? '/latest-article' : getSubPath(ctx)}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    $('h1.title').remove();

    let items = $('.regular-article-list, #list-container, .list-container')
        .find('.article-title, .title')
        .find('a')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            const link = $item.attr('href');

            return {
                title: $item.text(),
                link: /\/article\//.test(link!) ? `${link}/fullpage` : link,
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

                content('#salon_comment_widget-anchor').remove();
                content('ad2-recommender, footer, noscript').remove();
                content('a[data-sk="tooltip_parent"]').parent().remove();
                content('.ad-section, .recommender-title, .navigation-content').remove();

                content('.article-img-container').each((_, el) => {
                    content(el).replaceWith(
                        renderDescription({
                            image: content(el).find('img').attr('data-srcset')!.split('?', 1)[0] ?? undefined,
                        })
                    );
                });

                item.author = content('meta[property="article:author"]').attr('content');
                item.pubDate = parseDate(content('meta[property="article:published_time"]').attr('content')!);
                item.category = content('meta[property="article:tag"]')
                    .toArray()
                    .map((t) => content(t).attr('content')!);
                item.description = renderDescription({
                    image: content('meta[property="og:image"]').attr('content')!.split('?', 1)[0] ?? undefined,
                    description: content('.article-main-box, article[itemprop="articleBody"]').html() ?? undefined,
                });

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
