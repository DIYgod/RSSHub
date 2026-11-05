import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/hkjunkcall',
    radar: [
        {
            source: ['hkjunkcall.com/'],
            target: '',
        },
    ],
    name: '近期資訊',
    maintainers: ['nczitzk'],
    handler,
    url: 'hkjunkcall.com/',
};

async function handler() {
    const rootUrl = 'https://hkjunkcall.com';
    const currentUrl = `${rootUrl}/cdpushdash.asp`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);
    if ($('#challenge-container').length) {
        throw new Error(`HKJunkCall returned a verification challenge at ${currentUrl}. Public article data is unavailable.`);
    }

    const list = $('.hh15')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item).parent();

            return {
                title: $item.text(),
                link: $item.attr('href'),
            };
        });

    const seenLinks = new Set<string>();
    const uniqueList = list.filter((item) => {
        if (seenLinks.has(item.link!)) {
            return false;
        }
        seenLinks.add(item.link!);
        return true;
    });

    const items = await Promise.all(
        uniqueList.map(async (item) => {
            const details = await cache.tryGet(`hkjunkcall:article:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);
                if (!content('.card').length) {
                    throw new Error(`HKJunkCall article content was not found at ${item.link}. The source may be showing a verification page.`);
                }

                content('.card').find('div, h2').remove();

                item.guid = item.link!.split('/').pop();
                item.description = content('.card').html();
                const sourceDate = detailResponse.data.match(/<br \/>(\d+-\d+-\d+)<\/div><\/a>/)?.[1];
                const pubDate = sourceDate ? parseDate(sourceDate) : undefined;
                item.pubDate = pubDate && Number.isFinite(pubDate.getTime()) ? pubDate : undefined;

                return { guid: item.guid, description: item.description, pubDate: item.pubDate };
            });
            return { ...item, ...details };
        })
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
