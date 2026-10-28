import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const parseList = ($: CheerioAPI, baseUrl: string): Array<DataItem & { link: string }> =>
    $('article')
        .toArray()
        .filter((item) => $(item).find('h3 a[href*="/s/"]').length > 0)
        .map((item) => {
            const $item = $(item);
            const a = $item.find('h3 a[href*="/s/"]').first();
            const date = $item.find('time').attr('datetime');
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, baseUrl).href,
                author: $item.find('a[href*="/authors/"]').first().text(),
                category: $item.find('a[href*="/c/"]').first().text(),
                pubDate: date ? parseDate(`${date}T00:00:00Z`) : undefined,
            };
        });

export const parseItems = (list: Array<DataItem & { link: string }>) =>
    pMap(
        list,
        async (item) => ({
            ...item,
            description: await cache.tryGet(`literotica:body:${item.link}`, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                const content = $('[itemprop="articleBody"]').html();
                if (!content) {
                    throw new Error(`Unable to find the story content at ${item.link}`);
                }
                return content;
            }),
        }),
        { concurrency: 3 }
    );
