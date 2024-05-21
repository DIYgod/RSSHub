import { Route } from '@/types';
import logger from '@/utils/logger';
import puppeteer from '@/utils/puppeteer';
import { load } from 'cheerio';

export const route: Route = {
    path: '/articles',
    name: 'Articles',
    url: 'sustainabilitymag.com/articles',
    maintainers: ['@mintyfrankie'],
    categories: ['other'],
    example: '/sustainabilitymag/articles',
    radar: [
        {
            source: ['https://sustainabilitymag.com/articles'],
            target: '/sustainabilitymag/articles',
        },
    ],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    handler,
};

async function handler() {
    const baseURL = `https://${route.url}`;
    const feedLang = 'en';
    const feedDescription = 'Sustainability Magazine Articles';

    const browser = await puppeteer();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });
    logger.http(`Requesting ${baseURL}`);
    await page.goto(baseURL, {
        waitUntil: 'domcontentloaded',
    });
    const response = await page.content();
    page.close();

    const $ = load(response);

    const items = $('#content > div > div > div:nth-child(4) > div > div > div > div > div > div:nth-child(2) > div.infinite-scroll-component__outerdiv > div > div > div')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.text(),
                link: `${baseURL}${a.attr('href')}`,
            };
        });
    browser.close();

    // add full-text support

    return {
        title: 'Sustainability Magazine Articles',
        feedLang,
        feedDescription,
        link: `https://${baseURL}`,
        item: items,
    };
}
