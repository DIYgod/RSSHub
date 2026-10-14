import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news/:category?',
    categories: ['government'],
    example: '/whitehouse/news',
    parameters: { category: 'Category, see below, all by default' },
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
            source: ['whitehouse.gov/:category', 'whitehouse.gov/'],
            target: '/news/:category?',
        },
    ],
    name: 'News',
    maintainers: ['nczitzk', 'hkamran80'],
    handler,
    description: `| All | Articles | Briefings and Statements | Presidential Actions | Remarks |
| --- | -------- | ------------------------ | -------------------- | ------- |
|     | articles | briefings-statements     | presidential-actions | remarks |`,
};
function parsePublicationDate(value: string | undefined) {
    if (!value?.trim()) {
        return;
    }
    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? date : undefined;
}
async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'news';
    const rootUrl = 'https://www.whitehouse.gov';
    const currentUrl = `${rootUrl}/${category}/`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = load(response.data);
    const list = $('.post')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('a').first();
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, currentUrl).href,
                pubDate: parsePublicationDate($item.find('time').attr('datetime')),
                category: [$item.find('a[rel^=tag]').first().text()],
            };
        });
    const items = await unwrapFirstFailure(
        pMap(
            list,
            async (item) => {
                const detail = await cache.tryGet(`whitehouse:news:article:${item.link}`, async () => {
                    const response = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const $ = load(response.data);
                    $('.wp-block-whitehouse-topper').remove();
                    const body = $('.entry-content');
                    if (body.length !== 1) {
                        throw new Error(`Article body not found at ${item.link}`);
                    }
                    return { description: body.html() };
                });
                return { ...item, description: detail.description };
            },
            { concurrency: 3, stopOnError: false }
        )
    );
    return {
        title: $('title').text(),
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
