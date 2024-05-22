import { Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
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
    const baseURL = `https://sustainabilitymag.com`;
    const feedURL = `${baseURL}/articles`;
    const feedLang = 'en';
    const feedDescription = 'Sustainability Magazine Articles';

    const browser = await puppeteer();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });
    logger.http(`Requesting ${feedURL}`);
    await page.goto(feedURL, {
        waitUntil: 'domcontentloaded',
    });
    const response = await page.content();
    const $ = load(response);

    const list = $('#content > div > div > div:nth-child(4) > div > div > div > div > div > div:nth-child(2) > div.infinite-scroll-component__outerdiv > div > div > div')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('h3').first().text();
            const a = item.find('a').first();
            return {
                title,
                link: `${baseURL}${a.attr('href')}`,
            };
        });

    page.close();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const page = await browser.newPage();
                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    request.resourceType() === 'document' ? request.continue() : request.abort();
                });
                logger.http(`Requesting ${item.link}`);
                await page.goto(item.link, {
                    waitUntil: 'domcontentloaded',
                });
                const response = await page.content();
                page.close();

                const $ = load(response);
                item.pubDate = parseDate($('#content > div > div > div > div:nth-child(1) > div > div > div > div > div > div.ArticleHeader_Details__3n5Er > div.Breadcrumbs_Breadcrumbs__3yIKi > div:nth-child(1) > div').text());
                item.author = $('#content > div > div > div > div:nth-child(1) > div > div > div > div > div > div.ArticleHeader_Details__3n5Er > div.Type_m-body2__3AsD-.Type_d-body3__24mDH.Type_medium__2avgC > a').text();
                item.description = $('#content > div > div > div > div:nth-child(2) > div > div.GridWrapper_flex__1NgfS.GridWrapper_grow__23Wl1.GridWrapper_gutter-default__1hMKq').html();
                return item;
            })
        )
    );

    browser.close();

    return {
        title: 'Sustainability Magazine Articles',
        language: feedLang,
        description: feedDescription,
        link: `https://${baseURL}`,
        item: items,
    };
}
