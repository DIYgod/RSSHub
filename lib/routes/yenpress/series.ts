import { DataItem, Route } from '@/types';
import type { Context } from 'hono';

import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import * as cheerio from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

const render = (data) => art(path.join(__dirname, 'templates/series.art'), data);

export const route: Route = {
    path: '/series/:name',
    example: '/yenpress/series/alya-sometimes-hides-her-feelings-in-russian',
    parameters: { name: 'Series name' },
    name: 'Series',
    maintainers: ['TonyRL'],
    handler,
    radar: [
        {
            source: ['yenpress.com/series/:name'],
            target: '/series/:name',
        },
    ],
};

async function handler(ctx: Context) {
    const { name: series } = ctx.req.param();
    const baseUrl = 'https://yenpress.com';
    const link = `https://yenpress.com/series/${series}`;

    const response = await ofetch(link);
    const $ = cheerio.load(response);

    const list = $('.show-more-container .inline_block')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('span').text().trim(),
                link: new URL($item.find('a').attr('href')!, baseUrl).href,
            };
        }) as DataItem[];

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = cheerio.load(response);

                item.category = $('.detail-labels.mobile-only')
                    .eq(0)
                    .find('a')
                    .toArray()
                    .map((a) => $(a).text().trim());

                $('svg, .social-share, .desktop-only, .detail-labels').remove();

                const cover = $('.book-info').find('.book-cover-img').html();

                const bookInfo = $('.buy-info .deliver')
                    .toArray()
                    .map((item, i) => ({
                        deliver: $(item).text().trim(),
                        price: $('.book-price').eq(i).text().trim(),
                        from: $('.services')
                            .eq(i)
                            .find('.service')
                            .toArray()
                            .map((service) => {
                                const a = $(service).find('a');
                                return {
                                    name: a.text().trim(),
                                    link: a.attr('href'),
                                };
                            }),
                        detail: $('.detail-info')
                            .eq(i)
                            .find('div span')
                            .toArray()
                            .map((span) => {
                                const $span = $(span);
                                return {
                                    key: $span.text().trim(),
                                    value: $span.next().text().trim(),
                                };
                            }),
                    }));

                const info = $('.book-info');
                info.find('.buy-info, .series-cover').remove();

                item.description = render({
                    cover: cover! + info.html(),
                    bookInfo,
                });
                item.pubDate = timezone(parseDate(bookInfo[0].detail.find((d) => d.key === 'Release Date')!.value), 0);

                return item;
            })
        )
    );

    return {
        title: $('head title').text().trim(),
        description: $('.social-share p').text().trim(),
        link,
        item: items,
    };
}
