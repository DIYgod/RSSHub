import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://metr.org';

export async function fetchMetrCards(targetUrl: string): Promise<DataItem[]> {
    const response = await ofetch(targetUrl);
    const $ = load(response);
    const list: DataItem[] = $('div.card-post a[href]')
        .toArray()
        .map((element) => {
            const $element = $(element);
            return {
                title: $element.find('.card-title').text().trim(),
                link: new URL($element.attr('href') ?? '', baseUrl).href,
                pubDate: parseDate($element.find('.card-date').text().trim()),
                description: $element.find('.card-description').html() ?? undefined,
            };
        })
        .filter((item, index, items) => item.title && item.link && items.findIndex((other) => other.link === item.link) === index)
        .slice(0, 20);

    return pMap(
        list,
        (entry) =>
            cache.tryGet(entry.link!, async () => {
                if (!entry.link?.startsWith(baseUrl)) {
                    return entry;
                }
                const detail = await ofetch(entry.link!);
                const $$ = load(detail);
                entry.description = $$('.post-content').first().html() ?? entry.description;
                return entry;
            }),
        { concurrency: 5 }
    );
}
