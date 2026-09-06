import { load } from 'cheerio';

import type { Data, DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const rootUrl = 'https://www.gameres.com';

export const getFeed = async (currentUrl: string, query: string): Promise<Data> => {
    const response = await ofetch(currentUrl);
    const $ = load(response);

    const list: DataItem[] = $(query)
        .slice(0, 20)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.parent().get(0)!.tagName === 'a' ? $item.parent() : $item.children();

            return {
                title: a.text(),
                description: $item.parent().find('p').text(),
                link: `${rootUrl}${a.attr('href')}`,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                if (item.link!.includes('/wl?')) {
                    return item;
                }
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                const payload = JSON.parse(content('#__NUXT_DATA__').text());
                const article = payload.find((entry) => entry instanceof Object && 'dateline' in entry && 'content_html' in entry);

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
        item: items,
    };
};
