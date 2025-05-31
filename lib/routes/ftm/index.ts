import { Route } from '@/types';

import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/ftm',
    parameters: {},
    name: '文章',
    maintainers: ['dzx-dzx'],
    radar: [
        {
            source: ['www.ftm.eu'],
        },
    ],
    handler,
};

async function handler(ctx) {
    const rootUrl = 'https://www.ftm.eu';
    const currentUrl = `${rootUrl}/articles`;
    const response = await ofetch(currentUrl);

    const $ = load(response);

    const list = $('.article-card')
        .toArray()
        .map((e) => ({ link: $(e).attr('href'), title: $(e).find('h2').text() }))
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : Infinity);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const content = load(await ofetch(item.link));
                const ldjson = JSON.parse(content('[type="application/ld+json"]:not([data-schema])').text());

                item.pubDate = parseDate(ldjson.datePublished);
                item.updated = parseDate(ldjson.dateModified);

                item.author = content("[name='author']")
                    .toArray()
                    .map((e) => ({ name: $(e).attr('content') }));
                item.category = content('.collection .tab').text().trim() || null;

                item.description = content('.body').html();

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
