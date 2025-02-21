import { DataItem, Route } from '@/types';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
import puppeteer from '@/utils/puppeteer';
import { load } from 'cheerio';

// test url http://localhost:1200/asianfanfics/text-search/milklove

export const route: Route = {
    path: '/text-search/:keyword',
    categories: ['reading'],
    example: '/text-search/milklove',
    parameters: {
        keyword: '关键词',
    },
    name: '亚洲同人网关键词',
    maintainers: ['KazooTTT'],
    radar: [
        {
            source: ['www.asianfanfics.com/browse/text_search?q=:keyword'],
            target: '/text-search/:keyword',
        },
    ],
    description: `匹配亚洲同人网搜索关键词`,
    handler,
};

async function handler(ctx) {
    const keyword = ctx.req.param('keyword');

    const link = `https://www.asianfanfics.com/browse/text_search?q=${keyword}+`;

    // require puppeteer utility class and initialise a browser instance
    const browser = await puppeteer();
    // open a new tab
    const page = await browser.newPage();
    // intercept all requests
    await page.setRequestInterception(true);
    // only allow certain types of requests to proceed
    page.on('request', (request) => {
        // in this case, we only allow document requests to proceed
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });
    // ofetch requests will be logged automatically
    // but puppeteer requests are not
    // so we need to log them manually
    logger.http(`Requesting ${link}`);

    await page.goto(link, {
        // specify how long to wait for the page to load
        waitUntil: 'domcontentloaded',
    });
    // retrieve the HTML content of the page
    const response = await page.content();
    // close the tab
    page.close();

    const $ = load(response);

    const items: DataItem[] = $('.primary-container .excerpt')
        .toArray()
        .filter((element) => {
            const $element = $(element);
            return $element.find('.excerpt__title a').length > 0;
        })
        .map((element) => {
            const $element = $(element);
            const title = $element.find('.excerpt__title a').text();
            const link = 'https://www.asianfanfics.com' + $element.find('.excerpt__title a').attr('href');
            const author = $element.find('.excerpt__meta__name a').text().trim();
            const pubDate = parseDate($element.find('time').attr('datetime') || '');

            return {
                title,
                link,
                author,
                pubDate,
            };
        });

    // don't forget to close the browser instance at the end of the function
    browser.close();

    return {
        title: `Asianfanfics 亚洲同人网 - 关键词：${keyword}`,
        link,
        item: items,
    };
}
