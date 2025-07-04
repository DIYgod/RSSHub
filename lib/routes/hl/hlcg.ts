import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import puppeteer from '@/utils/puppeteer';
import logger from '@/utils/logger';

const getHlcg = async () => {
    const baseUrl = 'https://d2rpapu8kgjdgu.cloudfront.net';
    const browser = await puppeteer();
    const page = await browser.newPage();
    // await page.setRequestInterception(true);
    //   page.on('request', (request) => {
    //             // in this case, we only allow document requests to proceed
    //             request.resourceType() === 'document' ? request.continue() : request.abort();
    //         });
    const link = 'https://d2rpapu8kgjdgu.cloudfront.net/hlcg/';
    logger.http(`Requesting ${link}`);
    await page.goto(link, {
        // specify how long to wait for the page to load
        waitUntil: 'load',
    });
    const response = await page.content();
    // close the tab
    page.close();

    const $ = load(response);

    const list = $('div.video-item')
        // We use the `toArray()` method to retrieve all the DOM elements selected as an array.
        .toArray()
        // We use the `map()` method to traverse the array and parse the data we need from each element.
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.text(),
                description: item.find('.placeholder-img').first().html(),
                // We need an absolute URL for `link`, but `a.attr('href')` returns a relative URL.
                link: `${baseUrl}${a.attr('href')}`,
                pubDate: parseDate(item.find('relative-time').attr('datetime')),
                author: item.find('.opened-by a').text(),
                category: item
                    .find('a[id^=label]')
                    .toArray()
                    .map((item) => $(item).text()),
            };
        });
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                // // highlight-start
                // // reuse the browser instance and open a new tab
                // const page = await browser.newPage();
                // // set up request interception to only allow document requests
                // await page.setRequestInterception(true);
                // // page.on('request', (request) => {
                // //     request.resourceType() === 'document' ? request.continue() : request.abort();
                // // });

                // logger.http(`Requesting ${item.link}`);
                // await page.goto(item.link, {
                //     waitUntil: 'domcontentloaded',
                //     timeout: 30000,
                // });
                // const response = await page.content();
                // // close the tab after retrieving the HTML content
                // page.close();
                // // highlight-end

                // const $ = load(response);

                // item.description = $('.client-only-placeholder editormd-preview').first().html();
                // await
                await new Promise((resolve) => setTimeout(resolve, 1));
                return item;
            })
        )
    );

    // close the browser instance after all requests are done
    browser.close();

    return {
        title: '最新黑料',
        link: 'https://d2rpapu8kgjdgu.cloudfront.net/hlcg',
        item: items,
    };
};
export default getHlcg;
