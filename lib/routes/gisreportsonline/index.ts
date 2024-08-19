import { Route } from '@/types';

import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/:path{.*}',
    categories: ['new-media'],
    example: '/gis/c/security-challenges/',
    parameters: { path: '包含"Reports"页面下的路径' },
    name: '报告',
    maintainers: ['dzx-dzx'],
    radar: [
        {
            source: ['www.gisreportsonline.com'],
        },
    ],
    handler,
};

async function handler(ctx) {
    const rootUrl = 'https://www.gisreportsonline.com';
    const currentUrl = `${rootUrl}/${ctx.req.param('path')}`;
    const response = await ofetch(currentUrl);

    const $ = load(response);

    const list = $('article h3 a')
        .toArray()
        .map((e) => ({ link: $(e).attr('href'), title: $(e).text() }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const content = load(await ofetch(item.link));
                const ldjson = JSON.parse(content('script.rank-math-schema-pro').text())['@graph'].find((e) => e['@type'] === 'NewsArticle');

                item.pubDate = parseDate(ldjson.datePublished);
                item.updated = parseDate(ldjson.dateModified);
                item.author = [ldjson.author];
                item.category = ldjson.keywords.split(',');
                item.language = ldjson.inLanguage;

                item.description = content('header.entry-header ~ :not(#pos-conclusion ~ *)')
                    .toArray()
                    .map((e) => content(e).prop('outerHTML'))
                    .join('');

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
