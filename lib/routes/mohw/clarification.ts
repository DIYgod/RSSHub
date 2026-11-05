import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

export const route: Route = {
    path: '/clarification',
    categories: ['government'],
    example: '/mohw/clarification',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['mohw.gov.tw/'],
        },
    ],
    name: '即時新聞澄清',
    maintainers: ['nczitzk'],
    handler,
    url: 'mohw.gov.tw/',
};

async function handler() {
    const rootUrl = 'https://www.mohw.gov.tw';
    const currentUrl = `${rootUrl}/lp-17-1.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('section.list a[title]')
        .toArray()
        .flatMap((item): DataItem[] => {
            const $item = $(item);

            const title = $item.attr('title');
            const href = $item.attr('href');
            if (!title || !href) {
                return [];
            }

            return [{ title, link: new URL(href, rootUrl).href }];
        });

    items = await pMap(
        items,
        async (item) => {
            const details = await cache.tryGet(`${item.link}:details`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                const description = content('article.cpArticle').html();
                const date = content('meta[name="DC.Date"]').attr('content');
                const pubDate = date ? parseDateInTimezone(date, 8) : undefined;

                return { description, pubDate };
            });
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );

    return {
        title: '即時新聞澄清 - 台灣衛生福利部',
        link: currentUrl,
        item: items,
    };
}
