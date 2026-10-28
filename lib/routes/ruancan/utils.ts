import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const fetchFeed = async (ctx, currentUrl) => {
    const rootUrl = 'https://www.ruancan.com';
    currentUrl = `${rootUrl}${currentUrl}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const queryLimit = ctx.req.query('limit');
    const requestedLimit = queryLimit?.trim() ? Number(queryLimit) : NaN;
    const limit = Number.isFinite(requestedLimit) && requestedLimit >= 0 ? Math.floor(requestedLimit) : 15;
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
                const date = content('.entry-info .entry-date').attr('datetime');
                const pubDate = date ? parseDate(date) : undefined;
                const author = content('.entry-info .vcard a').first().text() || undefined;
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
