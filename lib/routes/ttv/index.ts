import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:category?',
    categories: ['traditional-media'],
    example: '/ttv',
    parameters: { category: '分类' },
    name: '分类',
    maintainers: ['dzx-dzx'],
    radar: [
        {
            source: ['news.ttv.com.tw/:category'],
        },
    ],
    handler,
};

async function handler(ctx) {
    const rootUrl = 'https://news.ttv.com.tw';
    const category = ctx.req.param('category') ?? 'realtime';
    const currentUrl = `${rootUrl}/${['realtime', 'focus'].includes(category) ? category : `category/${category}`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('div.news-list li')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 30)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                link: $(item).find('a').attr('href'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.title = content('title').text();
                item.pubDate = timezone(parseDate(content('meta[property="article:published_time"]').attr('content')), +8);
                item.category = content('div.article-body ul.tag')
                    .find('a')
                    .toArray()
                    .map((t) => content(t).text());
                const section = content("meta[property='article:section']").attr('content');
                if (!item.category.includes(section)) {
                    item.category.push(section);
                }
                item.description = content('#newscontent').html();
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
