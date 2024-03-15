import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { config } from '@/config';
import { parseDate } from '@/utils/parse-date';
import logger from '@/utils/logger';
import puppeteer from '@/utils/puppeteer';

// /iqiyi/user/video/:uid
// http://localhost:1200/iqiyi/user/video/2289191062
export const route: Route = {
    path: '/user/video/:uid',
    categories: ['multimedia'],
    example: '/iqiyi/user/video/2289191062',
    parameters: { uid: '用户名' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['iqiyi.com/u/:uid/*'],
        },
    ],
    name: '用户视频',
    maintainers: ['talengu', 'JimenezLi'],
    handler,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const link = `https://www.iqiyi.com/u/${uid}/videos`;

    // Use puppeteer because iqiyi page has a delay.
    const browser = await puppeteer();
    const data = await cache.tryGet(
        link,
        async () => {
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
            });
            logger.http(`Requesting ${link}`);
            await page.goto(link, {
                waitUntil: 'domcontentloaded',
            });
            await page.waitForSelector('li.pic-txt-li');
            const html = await page.content();

            const $ = load(html);
            const list = $('li.pic-txt-li');

            return {
                title: $('title').text(),
                link,
                item:
                    list &&
                    list
                        .map((index, item) => ({
                            title: $(item).attr('title'),
                            // description: `<img src="${$(item).find('.li-pic img').attr('src')}">`,
                            pubDate: parseDate($(item).find('.li-sub span.sub-date').text(), 'YYYY-MM-DD'),
                            link: $(item).find('.li-dec a').attr('href'),
                        }))
                        .get(),
            };
        },
        config.cache.routeExpire,
        false
    );
    browser.close();

    return data;
}
