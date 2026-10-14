import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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

    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet<Pick<DataItem, 'description' | 'pubDate' | 'category'>>(`verfghbw:article-details:v3:${item.link}`, async () => {
                const detail = await got(item.link);
                const $$ = load(detail.data);

                return {
                    description: $$('.news-text-wrap').html() ?? undefined,
                    pubDate: parsePublicationDate($$('.news-single time').attr('datetime')),
                    category: $$('.news-list-category')
                        .toArray()
                        .map((element) => $$(element).text().trim())
                        .filter(Boolean),
                };
            });

            return {
                ...item,
                description: details.description,
                pubDate: details.pubDate,
                category: details.category,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: 'Verfassungsgerichtshof Baden-Württemberg - Pressemitteilungen',
        link: listUrl,
        description: 'Pressemitteilungen des Verfassungsgerichtshof für das Land Baden-Württemberg',
        item: items,
    };
}

function parsePublicationDate(value?: string) {
    if (typeof value !== 'string' || !value) {
        return;
    }

    const date = parseDate(value, 'YYYY-MM-DD', true);
    // Preserve the source calendar day without inferring a publication time.
    return Number.isFinite(date.getTime()) ? timezone(date, 0) : undefined;
}
