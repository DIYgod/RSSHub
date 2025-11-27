import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';

import { type DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export function parseItems($: CheerioAPI, baseUrl: string, fetchRestrictedContent: boolean): Promise<DataItem[]> {
    const list = $('div.item-list ul li')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const a = $el.find('a').first();
            const title = a.attr('title')!;
            const link = fetchRestrictedContent ? `${a.attr('href')}&adult_view=1` : a.attr('href');
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

    return Promise.all(
        list.map((item) =>
            cache.tryGet(`${baseUrl}${item.link}`, async () => {
                const res = await ofetch(`${baseUrl}${item.link}`);
                const $ = load(res);
                const description = $.html('div.item-page');
                return {
                    ...item,
                    description,
                };
            })
        )
    ) as unknown as Promise<DataItem[]>;
}
