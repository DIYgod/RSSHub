import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const parsePublicationDate = (value: string | number | undefined, format?: string) => {
    if (typeof value !== 'number' && !value) {
        return;
    }
    const date = parseDate(value, format);
    return Number.isFinite(date.getTime()) ? date : undefined;
};
export const route: Route = {
    path: '/analysis',
    categories: ['new-media'],
    example: '/worldhappiness/analysis',
    name: 'Analysis',
    maintainers: ['nczitzk'],
    handler,
};
async function handler(ctx: Context) {
    const limit = getRouteLimit(ctx, 20);
    const rootUrl = 'https://www.worldhappiness.report';
    const currentUrl = `${rootUrl}/analysis/`;
    const response = await ofetch(currentUrl);
    const $ = load(response);
    const list = $('li.chapter')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('.chapter-title a');
            return {
                title: `${$item.find('.chapter-title-meta').text()}: ${a.text()}`,
                link: new URL(a.attr('href')!, rootUrl).href,
                pubDate: parsePublicationDate($item.find('.chapter-title-meta').text().split(' ', 1)[0], 'YYYY'),
                category: $item.attr('data-tags')?.split(', '),
            };
        })
        .slice(0, limit);
    const items = await unwrapFirstFailure(
        pMap(
            list,
            async (item) => {
                const detail = await cache.tryGet(`worldhappiness:analysis:detail:v2:${item.link}`, async () => {
                    const detailResponse = await ofetch(item.link);
                    const content = load(detailResponse);
                    return {
                        author: content('.author')
                            .toArray()
                            .map((author) => ({ name: content(author).contents().first().text().trim() })),
                        description: content('.chapter-body').html(),
                    };
                });
                return { ...item, author: detail.author, description: detail.description };
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
