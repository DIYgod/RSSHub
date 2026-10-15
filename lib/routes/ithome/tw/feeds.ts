import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

export const route: Route = {
    path: '/tw/feeds/:category',
    categories: ['new-media'],
    example: '/ithome/tw/feeds/news',
    parameters: { category: '類別' },
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
            source: ['www.ithome.com.tw/:category', 'www.ithome.com.tw/:category/feeds'],
        },
    ],
    name: 'Feeds',
    maintainers: ['miles170'],
    handler,
    description: `| 新聞 | AI       | Cloud | DevOps | 資安     |
| ---- | -------- | ----- | ------ | -------- |
| news | big-data | cloud | devops | security |`,
};

async function handler(ctx) {
    const baseUrl = 'https://www.ithome.com.tw';
    const currentUrl = `${baseUrl}/${ctx.req.param('category')}/feeds`;
    const response = await got(currentUrl);
    const $ = load(response.data);
    const name = $('a.active-trail').text();
    const items = await pMap(
        $('.title a').toArray(),
        async (item) => {
            const link = baseUrl + $(item).attr('href');
            const details = await cache.tryGet(`ithome:tw-article:${link}`, async () => {
                const response = await got(link);
                const $ = load(response.data);
                const date = $('.submitted .created').first().text();
                return {
                    title: $('.page-header').text(),
                    author: $('.author a').text(),
                    description: $('article').eq(0).html(),
                    pubDate: date && Number.isFinite(parseDate(date, 'YYYY-MM-DD', true).getTime()) ? parseDateInTimezone(date, 8) : undefined,
                    link,
                };
            });
            return { ...details, category: name };
        },
        { concurrency: 3 }
    );

    return {
        title: `${name} | iThome`,
        link: currentUrl,
        description: 'iThome Online 是臺灣第一個網路原生報，提供IT產業即時新聞、企業IT產品報導與測試、技術專題、IT應用報導、IT書訊，以及面向豐富的名家專欄。',
        item: items,
    };
}
