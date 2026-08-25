import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import timezone from '@/utils/timezone';

import { namespace } from './namespace';

const baseUrl = 'https://www.ahm.cn';

export const route: Route = {
    path: '/news/abxw',
    categories: ['travel'],
    example: '/ahm/news/abxw',
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.ahm.cn/News/List/abxw'],
            target: '/news/abxw',
        },
    ],
    name: '安博新闻',
    maintainers: ['magazian'],
    handler: async () => {
        const museumName = namespace.zh?.name || namespace.name;
        const listUrl = `${baseUrl}/News/List/abxw`;

        // Anhui Museum website use CT2-WAAP to prevent web scraping, so need to use Playwright to get the page content.
        const { page, destroy } = await getPlaywrightPage(listUrl, {
            gotoConfig: { waitUntil: 'domcontentloaded' },
        });

        let html: string;
        try {
            await page.waitForSelector('ul.img-cont-list li', {
                timeout: 15000,
            });
            html = await page.content();
        } finally {
            await destroy();
        }

        const $ = load(html);

        const items: DataItem[] = $('ul.img-cont-list li')
            .toArray()
            .map((el) => {
                const $el = $(el);
                const a = $el.find('a');
                const href = a.attr('href') ?? '';
                const link = new URL(href, baseUrl).href;

                const dateP = $el.find('.date p');
                const monthDay = dateP.eq(0).text();
                const year = dateP.eq(1).text();
                const dateStr = `${year}/${monthDay}`;

                return {
                    title: $el.find('.cont h3').text(),
                    link,
                    pubDate: timezone(parseDate(dateStr, 'YYYY/MM/DD'), 8),
                };
            });

        return {
            title: `${museumName} - 安博新闻`,
            link: listUrl,
            language: 'zh-CN',
            item: items,
        };
    },
};
