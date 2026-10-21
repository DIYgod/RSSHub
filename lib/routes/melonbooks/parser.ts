import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export function parseItems($: CheerioAPI, baseUrl: string, fetchRestrictedContent: boolean): Promise<DataItem[]> {
    const list = $('div.item-list ul li')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const a = $el.find('a').first();
            const title = a.attr('title')!;
            const url = new URL(a.attr('href')!, baseUrl);
            if (fetchRestrictedContent) {
                url.searchParams.set('adult_view', '1');
            }
            const link = url.href;
            // const author = $el.find('p.search-item-author-author a').text();
            const category = [$el.find('p.item-state').text()];
            const image = $el.find('div.item-image img').attr('data-src');
            return {
                title,
                link,
                category,
                image,
                banner: image,
            };
        });

    return pMap(
        list,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`melonbooks:body:${item.link}`, async () => {
                const res = await ofetch(item.link);
                const $ = load(res);
                return { description: $.html('div.item-page') };
            })),
        }),
        { concurrency: 3 }
    );
}
