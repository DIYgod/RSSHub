import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

export const fetchFeed = async (ctx, currentUrl) => {
    const rootUrl = 'https://www.ruancan.com';
    currentUrl = `${rootUrl}${currentUrl}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const limit = getRouteLimit(ctx, 15);
    const list = $('.item-title a');
    let items = (list.length ? list : $('.post-loop-list > .item > a'))
        .slice(0, limit)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            return {
                title: $item.text(),
                link: $item.attr('href'),
            };
        });

    items = await pMap(
        items,
        async (item) => {
            const detail = await cache.tryGet(item.link!, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('.entry-copyright').remove();

                content('.entry-content div').each((_, el) => {
                    if (/^ruanc-\d+/.test(content(el).attr('id')!)) {
                        content(el).remove();
                    }
                });

                const description = content('.entry-content').html();
                const category = content('.entry-info a[rel~="category"]')
                    .toArray()
                    .map((c) => content(c).text());
                const pubDate = parseDate(content('.entry-info .entry-date').attr('datetime')!);
                const author = content('.entry-info .vcard a').text();
                return { description, category, pubDate, author };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
