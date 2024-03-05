// @ts-nocheck
import cache from '@/utils/cache';
const cherrio = require('cheerio');
import { parseDate } from '@/utils/parse-date';
import puppeteer from '@/utils/puppeteer';

const pageUrl = 'https://support.bluestacks.com/hc/en-us/articles/360056960211-Release-Notes-BlueStacks-5';

export default async (ctx) => {
    const browser = await puppeteer();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });
    await page.goto(pageUrl, {
        waitUntil: 'domcontentloaded',
    });
    const res = await page.evaluate(() => document.documentElement.innerHTML);
    await page.close();

    const $ = cherrio.load(res);

    const items = $('div h3 a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        });

    await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const page = await browser.newPage();
                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
                });
                await page.goto(item.link, {
                    waitUntil: 'domcontentloaded',
                });
                const res = await page.evaluate(() => document.documentElement.innerHTML);
                const $ = cherrio.load(res);
                await page.close();

                item.description = $('div.article__body').html();
                item.pubDate = parseDate($('div.meta time').attr('datetime'));

                return item;
            })
        )
    );

    await browser.close();

    ctx.set('data', {
        title: $('.article__title').text().trim(),
        description: $('meta[name=description]').text().trim(),
        link: pageUrl,
        image: $('link[rel="shortcut icon"]').attr('href'),
        item: items,
    });
};
