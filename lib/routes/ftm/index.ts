import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

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
        .map((e): DataItem => ({
            link: $(e).attr('href'),
            title: $(e).find('h2').text(),
        }))
        .slice(0, getRouteLimit(ctx));

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const html = await ofetch(item.link!);
                const content = load(html);
                const ldjson = JSON.parse(content('[type="application/ld+json"]:not([data-schema])').text());

                item.pubDate = parseDate(ldjson.datePublished);
                item.updated = parseDate(ldjson.dateModified);

                item.author = content("[name='author']")
                    .toArray()
                    .map((e) => ({ name: $(e).attr('content')! }));
                item.category = content('.collection .tab').text().trim() || undefined;

                item.description = content('.body').html();

                return item;
            }),
        { concurrency: 3 }
    );
    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
