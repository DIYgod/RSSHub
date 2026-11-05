import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

async function getNoticeList(ctx, url, host, listSelector, titleSelector, contentSelector) {
    const response = await got(url);
    const $ = load(response.data);

    const list = $(listSelector)
        .toArray()
        .flatMap((item): Array<DataItem & { link: string }> => {
            const $item = $(item);
            const href = $item.find(titleSelector).attr('href');
            if (!href) {
                return [];
            }
            const date = $item
                .find('.news_meta')
                .text()
                .match(/\d{4}-\d{2}-\d{2}/)?.[0];
            return [
                {
                    pubDate: date ? timezone(parseDate(date), 8) : undefined,
                    title: $item.find(titleSelector).attr('title')!,
                    link: new URL(href, host).href,
                },
            ];
        });

    const out = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch.raw(item.link, { responseType: 'text' });
                if (response.url) {
                    item.link = response.url;
                }
                const $ = load(response._data ?? '');
                const title = $(contentSelector.title).text();
                item.title = title || item.title;
                item.description = $(contentSelector.content).html() ?? item.description;
                const date = $(contentSelector.date)
                    .text()
                    .match(/\d{4}-\d{2}-\d{2}/)?.[0];
                if (date) {
                    item.pubDate = timezone(parseDate(date), 8);
                }
                return item;
            }),
        { concurrency: 6 }
    );

    return out;
}

export { getNoticeList };
