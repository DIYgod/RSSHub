import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/',
    categories: ['programming'],
    example: '/distill',
    radar: [
        {
            source: ['distill.pub/'],
            target: '',
        },
    ],
    name: 'Latest',
    maintainers: ['nczitzk'],
    handler,
    url: 'distill.pub/',
};

async function handler() {
    const rootUrl = 'https://distill.pub';

    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = load(response.data);

    let items = $('.post-preview')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            return {
                title: $item.find('.title').text(),
                link: `${rootUrl}/${$item.children('a').attr('href')}`,
                category: $item
                    .find('.tags .tag')
                    .toArray()
                    .map((tag) => $(tag).text()),
            };
        });

    items = await pMap(
        items,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('d-contents').remove();

                content('img').each((_, el) => {
                    const image = content(el);
                    const src = image.attr('src');
                    if (src) {
                        image.attr('src', new URL(src, `${item.link}/`).href);
                    }
                });

                item.doi = content('meta[name="citation_doi"]').attr('content');
                item.pubDate = parseDate(`${content('meta[property="article:published"]').attr('content')}T00:00:00Z`);
                item.description = content('d-article').html();
                item.author = content('meta[property="article:author"]')
                    .toArray()
                    .map((author) => content(author).attr('content'))
                    .join(', ');

                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: rootUrl,
        item: items,
    };
}
