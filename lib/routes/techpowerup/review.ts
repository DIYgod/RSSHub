import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { baseUrl, fixImages, headers, parseReviews } from './utils';

export const route: Route = {
    path: '/review/:keyword?',
    categories: ['new-media'],
    example: '/techpowerup/review/amd',
    parameters: { keyword: 'Search Keyword' },
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
            source: ['techpowerup.com/review/search', 'techpowerup.com/review'],
            target: '',
        },
    ],
    name: 'Reviews',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.techpowerup.com/review/',
};

const language: Language = 'en';

async function handler(ctx) {
    const keyword = ctx.req.param('keyword');

    const url = new URL(`${baseUrl}/review/${keyword ? 'search/' : ''}`);
    if (keyword) {
        url.searchParams.set('q', keyword);
        url.searchParams.set('_', Date.now().toString());
    }

    const response = await ofetch(url.href, {
        headers,
    });

    const $ = load(response);

    const list = $('.reviewlist-bit')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('.title a');
            const date = $item.find('.date time').attr('datetime');
            return {
                title: a.text(),
                link: baseUrl + a.attr('href'),
                pubDate: date ? parseDate(date) : undefined, // 2023-05-21T16:05:14+00:00
                author: $item
                    .find('.author')
                    .contents()
                    .filter((_, c) => c.type === 'text')
                    .text(),
                category: $item
                    .find('.category')
                    .contents()
                    .filter((_, c) => c.type === 'text')
                    .text(),
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`techpowerup:detail-fields:v1:${item.link}`, async (): Promise<Partial<DataItem>> => {
                const response = await ofetch(item.link, { headers });
                const $ = load(response);
                fixImages($);
                const detail: Partial<DataItem> = {};
                await parseReviews($, detail);
                return detail;
            });
            return { ...item, ...detail, pubDate: detail.pubDate ?? item.pubDate };
        },
        { concurrency: 3 }
    );

    return {
        title: 'Reviews | TechPowerUp',
        link: url.href,
        language,
        image: 'https://tpucdn.com/apple-touch-icon-v1684568903519.png',
        item: items,
    };
}
