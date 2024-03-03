// @ts-nocheck
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const dayjs = require('dayjs');
import puppeteer from '@/utils/puppeteer';

const baseIndexUrl = 'https://www.sice.uestc.edu.cn/index.htm';
const host = 'https://www.sice.uestc.edu.cn/';

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

    const out = $('.notice p')
        .map((_, item) => {
            item = $(item);
            const now = dayjs();
            let date = dayjs(now.year() + '-' + item.find('a.date').text());
            if (now < date) {
                date = dayjs(now.year() - 1 + '-' + item.find('a.date').text());
            }

            return {
                title: item.find('a[href]').text(),
                link: host + item.find('a[href]').attr('href'),
                pubDate: parseDate(date),
            };
        })
        .get();

    ctx.set('data', {
        title: '信通学院通知',
        link: baseIndexUrl,
        description: '电子科技大学信息与通信工程学院通知公告',
        item: out,
    });
};
