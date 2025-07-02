import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import puppeteer from '@/utils/puppeteer';
import logger from '@/utils/logger';
import { URL } from 'node:url';

const rootUrl = 'https://unfccc.int';

export const route: Route = {
    path: '/news',
    categories: ['government'],
    example: '/unfccc/news',
    name: 'News',
    maintainers: ['gemini-agent'],
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
    },
    handler,
    radar: [
        {
            source: ['unfccc.int/news'],
        },
    ],
};

async function handler() {
    const currentUrl = `${rootUrl}/news`;

    const browser = await puppeteer();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        // Intercept requests to only load necessary resources.
        if (['document', 'script', 'xhr', 'fetch'].includes(request.resourceType())) {
            request.continue();
        } else {
            request.abort();
        }
    });

    logger.http(`Requesting ${currentUrl}`);
    await page.goto(currentUrl, {
        waitUntil: 'domcontentloaded',
    });

    const response = await page.content();
    await page.close();

    const $ = load(response);

    let items = $('article')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('span').text().trim();
            const href = item.find('a').attr('href');
            const link = href ? new URL(href, rootUrl).href : '';
            const pubDateText = item.find('.date').text().trim();

            return {
                title,
                link,
                pubDate: pubDateText ? parseDate(pubDateText) : undefined,
            };
        })
        .filter((item) => item.title && item.link); // Ensure item has title and link

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailPage = await browser.newPage();
                await detailPage.setRequestInterception(true);
                detailPage.on('request', (request) => {
                    if (['document', 'script', 'xhr', 'fetch'].includes(request.resourceType())) {
                        request.continue();
                    } else {
                        request.abort();
                    }
                });
                await detailPage.goto(item.link, {
                    waitUntil: 'networkidle0',
                });
                const detailHtml = await detailPage.content();
                await detailPage.close();
                const content = load(detailHtml);
                item.description = content('.field--name-field-page-main-text-body p').html();
                return item;
            })
        )
    );
    await browser.close();

    return {
        title: $('head title').text(),
        link: currentUrl,
        item: items,
    };
}
