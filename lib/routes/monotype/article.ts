import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/article',
    categories: ['design'],
    example: '/monotype/article',
    name: 'Featured Article',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const rootUrl = 'https://www.monotype.com/resources';

    const response = await ofetch(rootUrl);
    const $ = load(response);
    const list = $('a.component-title')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: new URL($item.attr('href')!, rootUrl).href,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet(`${item.link}:article-with-tags`, async () => {
                const res = await ofetch(item.link);
                const content = load(res);
                const publishedTime = content('meta[property="article:published_time"]').attr('content');
                const category = content('.content-field_category .field__item')
                    .toArray()
                    .map((element) => content(element).text());
                content('.node__content .content-field_category').remove();
                const pubDate = publishedTime ? parseDate(publishedTime, 'ddd, MM/DD/YYYY - HH:mm') : undefined;
                content('.node__content .breadcrumb, .node__content .node--view-mode-node-page-title, .node__content .resource-content-citation > time, .node__content .content-social-share-button-field').remove();
                const description = content('.node__content').html();
                return { description, pubDate, category };
            });
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );

    return {
        title: 'Monotype - Feature Articles',
        link: rootUrl,
        item: items,
    };
}
