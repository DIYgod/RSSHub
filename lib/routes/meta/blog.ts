import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import logger from '@/utils/logger';
import puppeteer from '@/utils/puppeteer';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/meta/blog',
    radar: [{ source: ['ai.meta.com/blog/'] }],
    name: 'Blog',
    maintainers: ['canonnizq'],
    handler
};

async function handler() {
    const baseUrl = 'https://ai.meta.com';

    const browser = await puppeteer();
    const page = await browser.newPage();
    await page.setRequestInterception(true);

    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });

    const link = `${baseUrl}/blog/`;
    logger.http(`Requesting ${link}`);
    await page.goto(link, {
        waitUntil: 'load',
    });

    const response = await page.content();
    page.close();

    const $ = load(response);
    const items = $('div._ams_')
        .toArray().map((item) => ({
            category: $(item).find('p._amt0').text(),
            link: $(item).find('a._amt1').attr('href'),
            title: $(item).find('a._amt1 p._amt2').text(),
            description: $(item).find('div._4ik4._4ik5 p._amt3').text(),
            pubDate: parseDate($(item).find('p._amt4').text())
    }));

    browser.close();

    return {
        title: 'AI at Meta Blog',
        link: 'https://ai.meta.com/blog/',
        item: items
    };
}