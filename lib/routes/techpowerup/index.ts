import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { baseUrl, headers, fixImages, parseReviews } from './utils';

export default async (ctx) => {
    const { data: response } = await got(baseUrl, {
        headers,
    });

    const $ = load(response);

    const list = $('.newspost')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('h1 a');
            const date = item.find('time').attr('datetime');
            return {
                title: a.text(),
                link: baseUrl + a.attr('href'),
                pubDate: date ? parseDate(date) : null, // 2023-05-21T16:05:14+00:00
                author: item.find('.byline address').text(),
                category: item
                    .find('.byline .flags span')
                    .toArray()
                    .map((item) => $(item).text().trim()),
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

                if (item.link.includes('/review/')) {
                    await parseReviews($, item);
                    return item;
                }

                // news
                item.description = $('.newspost .text').html();
                item.category = [
                    ...new Set([
                        ...item.category,
                        ...$('.tags li a')
                            .toArray()
                            .map((item) => $(item).text()),
                    ]),
                ];

                return item;
            })
        )
    );

    ctx.set('data', {
        title: 'TechPowerUp',
        link: baseUrl,
        language: 'en',
        image: 'https://tpucdn.com/apple-touch-icon-v1684568903519.png',
        item: items,
    });
};
