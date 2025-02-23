import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import puppeteer from '@/utils/puppeteer';

export const route: Route = {
    path: '/pbc/tradeAnnouncement',
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

    const browser = await puppeteer();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });
    await page.goto(link, {
        waitUntil: 'domcontentloaded',
    });
    const html = await page.evaluate(() => document.documentElement.innerHTML);
    const $ = load(html);
    const list = $('font.newslist_style')
        .map((_, item) => {
            item = $(item);
            const a = item.find('a[title]');
            return {
                title: a.attr('title'),
                link: new URL(a.attr('href'), 'http://www.pbc.gov.cn').href,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailPage = await browser.newPage();
                await detailPage.setRequestInterception(true);
                detailPage.on('request', (request) => {
                    request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
                });
                await detailPage.goto(item.link, {
                    waitUntil: 'domcontentloaded',
                });
                const detailHtml = await detailPage.evaluate(() => document.documentElement.innerHTML);
                const content = load(detailHtml);
                item.description = content('#zoom').html();
                item.pubDate = timezone(parseDate(content('#shijian').text()), +8);
                return item;
            })
        )
    );

    await browser.close();

    return {
        title: '中国人民银行 - 货币政策司公开市场交易公告',
        link,
        item: items,
    };
}
