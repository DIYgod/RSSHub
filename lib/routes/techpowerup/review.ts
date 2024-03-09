import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { baseUrl, headers, fixImages, parseReviews } from './utils';

export default async (ctx) => {
    const keyword = ctx.req.param('keyword');

    const url = new URL(`${baseUrl}/review/${keyword ? 'search/' : ''}`);
    if (keyword) {
        url.searchParams.set('q', keyword);
        url.searchParams.set('_', Date.now());
    }

    const { data: response } = await got(url, {
        headers,
    });

    const $ = load(response);

    const list = $('.reviewlist-bit')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('.title a');
            return {
                title: a.text(),
                link: baseUrl + a.attr('href'),
                pubDate: parseDate(item.find('.date time').attr('datetime')), // 2023-05-21T16:05:14+00:00
                author: item
                    .find('.author')
                    .contents()
                    .filter((_, c) => c.type === 'text')
                    .text()
                    .trim(),
                category: item
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
                const { data: response } = await got(item.link, {
                    headers,
                });
                const $ = load(response);

                fixImages($);

                await parseReviews($, item);

                return item;
            })
        )
    );

    ctx.set('data', {
        title: 'Reviews | TechPowerUp',
        link: url.href,
        language: 'en',
        image: 'https://tpucdn.com/apple-touch-icon-v1684568903519.png',
        item: items,
    });
};
