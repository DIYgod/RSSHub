import { Route } from '@/types';

import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import { config } from '@/config';
import puppeteer from '@/utils/puppeteer';

export const route: Route = {
    path: '/journal/:id',
    radar: [
        {
            source: ['pubs.acs.org/journal/:id', 'pubs.acs.org/'],
        },
    ],
    name: 'Unknown',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '';

    const rootUrl = 'https://pubs.acs.org';
    const currentUrl = `${rootUrl}/toc/${id}/0/0`;

    let title = '';

    const browser = await puppeteer();
    const items = await cache.tryGet(
        currentUrl,
        async () => {
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
            });
            await page.goto(currentUrl, {
                waitUntil: 'domcontentloaded',
            });
            await page.waitForSelector('.toc');

            const html = await page.evaluate(() => document.documentElement.innerHTML);
            await page.close();

            const $ = load(html);

            title = $('meta[property="og:title"]').attr('content');

            return $('.issue-item')
                .toArray()
                .map((item) => {
                    item = $(item);

                    const a = item.find('.issue-item_title a');
                    const doi = item.find('input[name="doi"]').attr('value');

                    return {
                        doi,
                        guid: doi,
                        title: a.text(),
                        link: `${rootUrl}${a.attr('href')}`,
                        pubDate: parseDate(item.find('.pub-date-value').text(), 'MMMM D, YYYY'),
                        author: item
                            .find('.issue-item_loa li')
                            .toArray()
                            .map((a) => $(a).text())
                            .join(', '),
                        description: art(path.join(__dirname, 'templates/description.art'), {
                            image: item.find('.issue-item_img').html(),
                            description: item.find('.hlFld-Abstract').html(),
                        }),
                    };
                });
        },
        config.cache.routeExpire,
        false
    );

    await browser.close();

    return {
        title,
        link: currentUrl,
        item: items,
    };
}
