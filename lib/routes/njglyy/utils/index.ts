import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

async function getNoticeList(ctx, url, host, listSelector, itemSelector, titleSelector, contentSelector) {
    const response = await got(url);
    const $ = load(response.data);

    const list = $(listSelector)
        .toArray()
        .flatMap((item): Array<DataItem & { link: string }> => {
            const $item = $(item);
            const href = $item.find(itemSelector).attr('href');
            if (!href) {
                return [];
            }
            return [
                {
                    title: $item.find(titleSelector).text(),
                    link: new URL(href, host).href,
                },
            ];
        });

    const out = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch.raw(item.link, { responseType: 'text' });
                if (response.url === item.link) {
                    const $ = load(response._data ?? '');
                    item.title = $(contentSelector.title).text();
                    item.description = $(contentSelector.content)
                        .html()
                        ?.replaceAll('src="/', () => `src="${new URL('.', host).href}`)
                        .replaceAll('href="/', () => `href="${new URL('.', host).href}`)
                        .trim();
                    const preDate = $(contentSelector.date)
                        .text()
                        .match(/(\d{4}-\d{2}-\d{2})/)?.[1];
                    item.pubDate = preDate ? timezone(parseDate(preDate, 'YYYY-MM-DD'), 8) : undefined;
                } else {
                    item.description = '该通知无法直接预览，请点击原文链接↑查看';
                }
                return item;
            }),
        { concurrency: 6 }
    );

    return out;
}

export { getNoticeList };
