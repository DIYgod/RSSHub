// @ts-nocheck
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import puppeteer from '@/utils/puppeteer';

const baseIndexUrl = 'https://www.auto.uestc.edu.cn/index/tzgg1.htm';
const host = 'https://www.auto.uestc.edu.cn/';

export default async (ctx) => {
    const browser = await puppeteer({ stealth: true });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });
    await page.goto(baseIndexUrl, {
        waitUntil: 'networkidle2',
    });
    const content = await page.content();
    await browser.close();

    const $ = load(content);

    const items = $('dl.clearfix');

    const out = $(items)
        .map((_, item) => {
            item = $(item);
            const newsTitle = item.find('a').text();
            const newsLink = host + item.find('a[href]').attr('href').slice(3);
            const newsPubDate = parseDate(item.find('span').text());

            return {
                title: newsTitle,
                link: newsLink,
                pubDate: newsPubDate,
            };
        })
        .get();

    ctx.set('data', {
        title: '电子科技大学自动化学院通知',
        link: baseIndexUrl,
        description: '电子科技大学自动化工程学院通知',
        item: out,
    });
};
