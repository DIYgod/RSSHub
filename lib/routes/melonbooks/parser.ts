import { type DataItem } from '@/types';
import { CheerioAPI, load } from 'cheerio';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export function parseItems($: CheerioAPI, baseUrl: string): Promise<DataItem[]> {
    const list = $('div.item-list ul li')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const a = $el.find('a').first();
            const title = a.attr('title')!;
            const link = a.attr('href')!;
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
            cache.tryGet(item.link, async () => {
                const res = await ofetch(`${baseUrl}${item.link}`);
                const $ = load(res);
                const description = $('div.item-detail')
                    .toArray()
                    .map((item) => $.html(item))
                    .join('');
                return {
                    ...item,
                    description,
                };
            })
        )
    ) as unknown as Promise<DataItem[]>;
}
