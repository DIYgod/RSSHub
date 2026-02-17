import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://research.google';

export const route: Route = {
    path: '/research',
    categories: ['blog'],
    example: '/google/research',
    name: 'Research Blog',
    maintainers: ['Levix', 'cscnk52'],
    radar: [
        {
            source: ['research.google'],
        },
    ],
    handler: async () => {
        const response = await ofetch(`${baseUrl}/blog`);
        const $ = load(response);
        const list = $('div.js-configurable-list .blog-posts-grid__cards .glue-grid__col')
            .toArray()
            .map((eleItem) => {
                const item = $(eleItem);
                const a = item.find('a').first();
                return {
                    title: a.find('.headline-5').text(),
                    link: `${baseUrl}${a.attr('href')}`,
                    pubDate: parseDate(item.find('.glue-label.glue-spacer-1-bottom').text()),
                    author: 'Google',
                    category: item
                        .find('.not-glue.caption')
                        .toArray()
                        .map((item) => $(item).text().replace('·', '').trim()),
                };
            });

        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    const response = await ofetch(item.link);
                    const $ = load(response);
                    item.description = $('.blog-detail-wrapper.js-gt-blog-detail-wrapper').html();
                    return item;
                })
            )
        );

        return {
            title: 'Google Research Blog',
            link: `${baseUrl}/blog`,
            item: items,
        };
    },
};
