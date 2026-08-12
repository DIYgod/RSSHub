import { load } from 'cheerio';

import type { Data, DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const rootUrl = 'https://www.gameres.com';

export default async function getFeed(currentUrl: string, query: string): Promise<Data> {
    const response = await ofetch(currentUrl);
    const $ = load(response);

    const list = $(query)
        .slice(0, 20)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.parent().get(0)!.tagName === 'a' ? $item.parent() : $item.children();

            return {
                title: a.text().trim(),
                description: $item.parent().find('p').text(),
                link: `${rootUrl}${a.attr('href')}`,
            };
        }) as DataItem[];

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                // external links (/wl?m=...) redirect off-site and cannot be scraped for detail
                if (item.link!.includes('/wl?')) {
                    return item;
                }
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                // full article data lives in the Nuxt payload; the DOM only shows MM-DD dates
                const payload = JSON.parse(content('#__NUXT_DATA__').text());
                const article = payload.find((entry) => entry && typeof entry === 'object' && !Array.isArray(entry) && 'dateline' in entry && 'content_html' in entry);

                item.description = payload[article.content_html];
                item.title = payload[article.subject];
                item.pubDate = parseDate(payload[article.dateline] * 1000);
                item.author = payload[article.author];

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: rootUrl,
        item: items as DataItem[],
    };
}
