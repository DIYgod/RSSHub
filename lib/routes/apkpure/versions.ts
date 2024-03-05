// @ts-nocheck
import { load } from 'cheerio';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
import puppeteer from '@/utils/puppeteer';

export default async (ctx) => {
    const { pkg, region = 'en' } = ctx.req.param();
    const baseUrl = 'https://apkpure.com';
    const link = `${baseUrl}/${region}/${pkg}/versions`;

    const browser = await puppeteer();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });
    logger.http(`Requesting ${link}`);
    await page.goto(link, {
        waitUntil: 'domcontentloaded',
    });

    const r = await page.evaluate(() => document.documentElement.innerHTML);
    browser.close();

    const $ = load(r);
    const img = new URL($('.ver-top img').attr('src'));
    img.searchParams.delete('w'); // get full resolution icon

    const items = $('.ver li')
        .toArray()
        .map((ver) => {
            ver = $(ver);
            return {
                title: ver.find('.ver-item-n').text(),
                description: ver.html(),
                link: `${baseUrl}${ver.find('a').attr('href')}`,
                pubDate: parseDate(ver.find('.update-on').text().replaceAll(/年|月/g, '-').replace('日', '')),
            };
        });

    ctx.set('data', {
        title: $('.ver-top-h1').text(),
        description: $('.ver-top-title p').text(),
        image: img.href,
        language: region ?? 'en',
        link,
        item: items,
    });
};
