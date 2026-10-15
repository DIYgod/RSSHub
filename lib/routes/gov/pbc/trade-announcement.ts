import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/tradeAnnouncement',
    categories: ['finance'],
    example: '/gov/pbc/tradeAnnouncement',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '货币政策司公开市场交易公告',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const link = 'http://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125431/125475/index.html';
    const { page, destroy } = await getPlaywrightPage(link, { noGoto: true, closeTimeout: 0 });
    try {
        await page.route('**/*', (route) => (['document', 'script'].includes(route.request().resourceType()) ? route.continue() : route.abort()));
        await page.goto(link, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('font.newslist_style');
        const pageContent = await page.content();
        const $ = load(pageContent);
        const list = $('font.newslist_style')
            .toArray()
            .map((item): DataItem => {
                const a = $(item).find('a[title]');
                return {
                    title: a.attr('title')!,
                    link: new URL(a.attr('href')!, 'http://www.pbc.gov.cn').href,
                };
            });
        const items = await pMap(
            list,
            (item) =>
                cache.tryGet(item.link!, async () => {
                    await page.goto(item.link!, { waitUntil: 'domcontentloaded' });
                    await page.waitForSelector('#zoom');
                    const detailContent = await page.content();
                    const content = load(detailContent);
                    item.description = content('#zoom').html();
                    const dateText = content('#shijian').text().trim();
                    item.pubDate = dateText ? timezone(parseDate(dateText), 8) : undefined;
                    return item;
                }),
            { concurrency: 1 }
        );
        return {
            title: '中国人民银行 - 货币政策司公开市场交易公告',
            link,
            item: items,
        };
    } finally {
        await destroy();
    }
}
