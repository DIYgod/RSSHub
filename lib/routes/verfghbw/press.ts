import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://verfgh.baden-wuerttemberg.de';
const listUrl = `${rootUrl}/presse-und-service/pressemitteilungen/`;

export const route: Route = {
    path: '/press',
    categories: ['government'],
    example: '/verfghbw/press',
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
            source: ['verfgh.baden-wuerttemberg.de/presse-und-service/pressemitteilungen/'],
            target: '/press',
        },
    ],
    name: 'Press releases',
    maintainers: ['quinn-dev'],
    handler,
    url: 'verfgh.baden-wuerttemberg.de/presse-und-service/pressemitteilungen/',
};

async function handler() {
    const response = await got(listUrl);
    const $ = load(response.data);

    const list = $('.news-singel')
        .toArray()
        .map((item) => {
            const $item = $(item);

            return {
                title: $item.find('.news-header').text(),
                link: new URL($item.attr('href')!, rootUrl).href,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detail = await got(item.link);
                const $$ = load(detail.data);

                return {
                    ...item,
                    description: $$('.news-text-wrap').html(),
                    pubDate: parseDate($$('.news-single time').attr('datetime')!),
                };
            })
        )
    );

    return {
        title: 'Verfassungsgerichtshof Baden-Württemberg - Pressemitteilungen',
        link: listUrl,
        description: 'Pressemitteilungen des Verfassungsgerichtshof für das Land Baden-Württemberg',
        item: items,
    };
}
