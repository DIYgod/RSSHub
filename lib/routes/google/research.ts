import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
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
            source: ['research.google', 'research.google/blog'],
        },
    ],
    handler: async () => {
        const response = await ofetch(`${baseUrl}/blog`);
        const $ = load(response);
        const list = $('div.js-configurable-list .blog-posts-grid__cards .glue-grid__col')
            .toArray()
            .map((eleItem): DataItem => {
                const item = $(eleItem);
                const a = item.find('a');
                const date = item.find('.glue-card__eyebrow').text();
                return {
                    title: a.find('.headline-6').text(),
                    link: `${baseUrl}${a.attr('href')}`,
                    pubDate: date ? parseDate(`${date} UTC`) : undefined,
                    category: item
                        .find('.not-glue.caption')
                        .toArray()
                        .map((item) => $(item).text().replace('·', '').trim()),
                };
            });

        const items = await Promise.all(
            list.map(async (item) => {
                const content = await cache.tryGet(`google:research:content:${item.link}`, async () => {
                    const response = await ofetch(item.link!);
                    const $ = load(response);
                    return {
                        description: $('.blog-detail-wrapper.js-gt-blog-detail-wrapper').html() ?? undefined,
                        author: $('.basic-hero--blog-detail__description p').eq(1).text() || undefined,
                    };
                });
                return { ...item, ...content };
            })
        );

        return {
            title: 'Google Research Blog',
            link: `${baseUrl}/blog`,
            item: items,
        };
    },
};
