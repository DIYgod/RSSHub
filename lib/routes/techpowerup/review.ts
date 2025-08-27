import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { baseUrl, headers, fixImages, parseReviews } from './utils';

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
            return {
                title: a.text(),
                link: baseUrl + a.attr('href'),
                pubDate: parseDate($item.find('.date time').attr('datetime')), // 2023-05-21T16:05:14+00:00
                author: $item
                    .find('.author')
                    .contents()
                    .filter((_, c) => c.type === 'text')
                    .text()
                    .trim(),
                category: $item
                    .find('.category')
                    .contents()
                    .filter((_, c) => c.type === 'text')
                    .text()
                    .trim(),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link, {
                    headers,
                });
                const $ = load(response);

                fixImages($);

                await parseReviews($, item);

                return item;
            })
        )
    );

    return {
        title: 'Reviews | TechPowerUp',
        link: url.href,
        language: 'en',
        image: 'https://tpucdn.com/apple-touch-icon-v1684568903519.png',
        item: items,
    };
}
