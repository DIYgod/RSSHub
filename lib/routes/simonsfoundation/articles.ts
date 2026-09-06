import { load } from 'cheerio';

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
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: parseDate($item.find('.news-date').text()),
            };
        });

    return {
        title: 'Simons Foundation | Articles',
        link: url,
        item: await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link!, async () => {
                    const response = await ofetch(item.link!);
                    const capture = load(response);

                    const banner = capture('div.o-page-header__hero').html();
                    item.author = capture('.m-meta__inherit').text();

                    capture('.m-block-info__animation').remove();
                    capture('.o-blocks__left').remove();
                    capture('.m-tags').remove();

                    item.description = banner === null ? capture('.o-blocks').html() : banner + capture('.o-blocks').html();

                    return item;
                })
            )
        ),
    };
}
