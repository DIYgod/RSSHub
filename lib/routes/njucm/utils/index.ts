import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

async function getNoticeList(ctx, url, host, listSelector, titleSelector, contentSelector) {
    const response = await got(url);
    const $ = load(response.data);

    const list = $(listSelector)
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            return {
                pubDate: parseDate($item.find('.news_meta').text(), 8),
                title: $item.find(titleSelector).attr('title')!,
                link: host + $item.find(titleSelector).attr('href'),
            };
        });

    const out = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch.raw(item.link);
                item.link = response.url;
                const $ = load(response._data);
                item.title = $(contentSelector.title).text();
                item.description = $(contentSelector.content).html();
                return item;
            }),
        { concurrency: 6 }
    );

    return out;
}

export { getNoticeList };
