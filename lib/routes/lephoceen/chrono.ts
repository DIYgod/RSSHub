import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/chrono',
    categories: ['sport'],
    example: '/lephoceen/chrono',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['lephoceen.fr/chrono'],
            target: '/chrono',
        },
    ],
    name: 'Fil Info (Chrono)',
    maintainers: ['Loopy03'],
    handler: async (_) => {
        const baseUrl = 'https://www.lephoceen.fr';
        const response = await ofetch(`${baseUrl}/chrono`);
        const $ = load(response);

        const list = $('article.feed-card')
            .toArray()
            .map((item): DataItem => {
                const $item = $(item);
                return {
                    title: $item.find('h2').text(),
                    link: new URL($item.find('a.feed-card-link').attr('href')!, baseUrl).href,
                    description: $item.find('p[data-smart-excerpt]').text(),
                    category: [$item.find('.feed-card-badge').text().trim()],
                    image: $item.find('img').attr('src'),
                };
            })
            .filter((item, index, items) => items.findIndex((candidate) => candidate.link === item.link) === index);

        // The list only shows relative times, so read the date from each page.
        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link!, async () => {
                    const page = await ofetch(item.link!);
                    const $page = load(page);

                    item.pubDate = parseDate($page('time[datetime]').first().attr('datetime')!);
                    item.description = $page('.article-content').html() ?? item.description;

                    return item;
                })
            )
        );

        return {
            title: 'Le Phocéen - Fil Info',
            link: `${baseUrl}/chrono`,
            item: items,
        };
    },
};
