// @ts-nocheck
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const { baseUrl } = require('./utils');
import { config } from '@/config';
import puppeteer from '@/utils/puppeteer';

export default async (ctx) => {
    const { name = 'pipeline' } = ctx.req.param();
    const link = `${baseUrl}/blogs/${name}/feed`;

    const response = await cache.tryGet(
        link,
        async () => {
            const browser = await puppeteer();
            const page = await browser.newPage();
            await page.setRequestInterception(true);

            page.on('request', (request) => {
                request.resourceType() === 'document' ? request.continue() : request.abort();
            });

            await page.goto(link, {
                waitUntil: 'domcontentloaded',
            });

            const response = await page.content();

            page.close();
            browser.close();
            return response;
        },
        config.cache.routeExpire,
        false
    );

    const $ = load(response, { xmlMode: true });
    const items = $('item')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('title').text().trim(),
                link: item.find('link').text().trim(),
                author: item.find('dc\\:creator').text().trim(),
                pubDate: parseDate(item.find('pubDate').text().trim()),
                description: item.find('content\\:encoded').text().trim(),
            };
        });

    // The RSS feed is implemented by a keyword search on the science.org end
    // so the description field of the feed looks like this:
    const name_re = /Keyword search result for Blog Series: (?<blog_name>[^-]+) --/;
    const { blog_name = 'Unknown Title' } = $('channel > description').text().match(name_re).groups;

    ctx.set('data', {
        title: `Science Blogs: ${blog_name}`,
        description: `A Science.org blog called ${blog_name}`,
        image: `${baseUrl}/apple-touch-icon.png`,
        link: `${baseUrl}/blogs/${name}`,
        language: 'en-US',
        item: items,
    });
};
