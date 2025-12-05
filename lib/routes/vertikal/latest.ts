import * as cheerio from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/latest',
    categories: ['new-media'],
    example: '/vertikal/latest',
    radar: [
        {
            source: ['vertikal.net/en/news', 'vertikal.net'],
        },
    ],
    name: 'News Archive',
    maintainers: ['TonyRL'],
    handler,
    url: 'vertikal.net/en/news',
};

const baseUrl = 'https://vertikal.net';

async function handler() {
    const response = await ofetch(`${baseUrl}/en/homepage/async-news-loader`, {
        query: {
            perPage: 24,
            page: 1,
        },
    });
    const $ = cheerio.load(response);

    const list = $('.grid__column')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('.news-teaser__title').text(),
                link: `${baseUrl}${$item.find('.news-teaser').attr('href')}`,
                pubDate: parseDate($item.find('.news-teaser__date').text(), 'DD.MM.YYYY'),
                description: $item.find('.news-teaser__text').text(),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = cheerio.load(response);

                const content = $('.newsentry');

                item.category = content
                    .find('.newsentry__tags a')
                    .toArray()
                    .map((tag) => $(tag).text().trim());

                content.find('.newsentry__date, .newsentry__title, .lazyimage-placeholder, .newsentry__tags, .newsentry__share, .newsentry__comments, .newsentry__write-comment').remove();

                item.description = content.html();

                return item;
            })
        )
    );

    return {
        title: 'News Archive | Vertikal.net',
        link: `${baseUrl}/en/news`,
        image: `${baseUrl}/apple-touch-icon-152x152.png`,
        item: items,
    };
}
