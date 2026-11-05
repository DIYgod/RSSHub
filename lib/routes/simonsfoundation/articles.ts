import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/articles',
    categories: ['new-media'],
    example: '/simonsfoundation/articles',
    name: 'Articles',
    maintainers: ['emdoe'],
    handler,
};

async function handler() {
    const url = 'https://www.simonsfoundation.org/news/articles/';

    const response = await ofetch(url);
    const $ = load(response);

    const list = $('.news-links-wrapper')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('a.news-title');
            const date = $item.find('.news-date').text();
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: date ? parseDate(`${date} +0000`, 'MMMM DD, YYYY ZZ') : undefined,
            };
        });

    return {
        title: 'Simons Foundation | Articles',
        link: url,
        item: await pMap(
            list,
            async (item) => {
                const details = await cache.tryGet(`simonsfoundation:article:v4:${item.link}`, async () => {
                    const response = await ofetch(item.link!);
                    const capture = load(response);
                    const published = capture('meta[property="article:published_time"]').attr('content');

                    const banner = capture('div.o-page-header__hero').html();
                    const author =
                        capture('.m-meta')
                            .first()
                            .children('span')
                            .first()
                            .text()
                            .replace(/^By\s+/, '') || undefined;

                    capture('.m-block-info__animation').remove();
                    capture('.o-blocks__left').remove();
                    capture('.m-tags').remove();

                    return {
                        pubDate: published ? parseDate(published) : undefined,
                        author,
                        description: banner === null ? capture('.o-blocks').html() : banner + capture('.o-blocks').html(),
                    };
                });
                return { ...item, ...details, pubDate: details.pubDate ?? item.pubDate };
            },
            { concurrency: 3 }
        ),
    };
}
