import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const parsePublicationDate = (value: string | number | undefined, format?: string) => {
    if (typeof value !== 'number' && !value) {
        return;
    }
    const date = parseDate(value, format);
    return Number.isFinite(date.getTime()) ? date : undefined;
};
export const route: Route = {
    path: '/news',
    categories: ['new-media'],
    example: '/worldhappiness/news',
    name: 'News',
    maintainers: ['nczitzk'],
    handler,
};
async function handler() {
    const rootUrl = 'https://www.worldhappiness.report';
    const currentUrl = `${rootUrl}/news/`;
    const response = await ofetch(currentUrl);
    const $ = load(response);
    const list = $('.news-card')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a.post-link');
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, rootUrl).href,
                pubDate: parsePublicationDate($item.find('time.post-date').attr('datetime')),
            };
        });
    const items = await unwrapFirstFailure(
        pMap(
            list,
            async (item) => {
                const detail = await cache.tryGet(`worldhappiness:news:detail:v2:${item.link}`, async () => {
                    const detailResponse = await ofetch(item.link);
                    const content = load(detailResponse);
                    return {
                        description: content('.post-body').html(),
                    };
                });
                return { ...item, description: detail.description };
            },
            { concurrency: 3, stopOnError: false }
        )
    );
    return {
        title: $('head title').text(),
        link: currentUrl,
        item: items,
    };
}
async function unwrapFirstFailure<T>(promise: Promise<T>): Promise<T> {
    try {
        return await promise;
    } catch (error) {
        throw error instanceof AggregateError ? error.errors[0] : error;
    }
}
