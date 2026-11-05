import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news',
    categories: ['bbs'],
    example: '/wenxuecity/news',
    name: '焦点新闻',
    maintainers: ['nczitzk'],
    handler,
};
function parsePublicationDate(value: string | undefined) {
    if (!value?.trim()) {
        return;
    }
    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? timezone(date, 8) : undefined;
}
async function handler() {
    const rootUrl = 'https://www.wenxuecity.com';
    const currentUrl = `${rootUrl}/news/`;
    const response = await ofetch(currentUrl);
    const $ = load(response);
    const list = $('div.mainwrap div.block div.wrapper ul li a')
        .slice(0, 15)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: `${rootUrl}${$item.attr('href')}`,
            };
        });
    const items = await unwrapFirstFailure(
        pMap(
            list,
            async (item) => {
                const detail = await cache.tryGet(`wenxuecity:news:article:${item.link}`, async () => {
                    const detailResponse = await ofetch(item.link!, {
                        headers: {
                            Referer: currentUrl,
                        },
                    });
                    const content = load(detailResponse);
                    const body = content('#articleContent');
                    if (body.length !== 1) {
                        throw new Error(`Article body not found at ${item.link}`);
                    }
                    return {
                        description: body.html(),
                        author: content('[itemprop=author]').first().text().trim() || undefined,
                        pubDate: parsePublicationDate(content('time[itemprop="datePublished"]').text()),
                    };
                });
                return { ...item, description: detail.description, author: detail.author, pubDate: detail.pubDate };
            },
            { concurrency: 3, stopOnError: false }
        )
    );
    return {
        title: '焦点新闻 - 文学城',
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
