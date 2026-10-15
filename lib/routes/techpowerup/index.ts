import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { baseUrl, fixImages, headers, parseReviews } from './utils';

export const route: Route = {
    path: '/',
    radar: [
        {
            source: ['techpowerup.com/'],
        },
    ],
    name: 'Latest Content',
    maintainers: ['TonyRL'],
    example: '/techpowerup',
    handler,
    url: 'www.techpowerup.com/',
};

const language: Language = 'en';

async function handler() {
    const response = await ofetch(baseUrl, {
        headers,
    });

    const $ = load(response);

    const list = $('.newspost')
        .toArray()
        .map((item): DataItem & { category: string[]; link: string } => {
            const $item = $(item);
            const a = $item.find('h1 a');
            const date = $item.find('time').attr('datetime');
            return {
                title: a.text(),
                link: baseUrl + a.attr('href'),
                pubDate: date ? parseDate(date) : undefined, // 2023-05-21T16:05:14+00:00
                author: $item.find('.byline address').text(),
                category: $item
                    .find('.byline .flags span')
                    .toArray()
                    .map((item) => $(item).text().trim()),
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`techpowerup:detail-fields:v1:${item.link}`, async (): Promise<Partial<DataItem>> => {
                const response = await ofetch(item.link, { headers });
                const $ = load(response);
                fixImages($);
                if (item.link.includes('/review/')) {
                    const detail: Partial<DataItem> = {};
                    await parseReviews($, detail);
                    return detail;
                }
                return {
                    description: $('.newspost .text').html(),
                    category: $('.tags li a')
                        .toArray()
                        .map((tag) => $(tag).text()),
                };
            });
            return { ...item, ...detail, pubDate: detail.pubDate ?? item.pubDate, category: [...new Set([...item.category, ...(detail.category ?? [])])] };
        },
        { concurrency: 3 }
    );

    return {
        title: 'TechPowerUp',
        link: baseUrl,
        language,
        image: 'https://tpucdn.com/apple-touch-icon-v1684568903519.png',
        item: items,
    };
}
