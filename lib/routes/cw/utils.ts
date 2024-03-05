// @ts-nocheck
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { getCookies, setCookies } from '@/utils/puppeteer-utils';
import logger from '@/utils/logger';
let cookie;

const baseUrl = 'https://www.cw.com.tw';

const pathMap = {
    today: {
        pageUrl: () => '/today',
        limit: 30,
    },
    master: {
        pageUrl: (channel) => `/masterChannel.action?idMasterChannel=${channel}`,
        limit: 12,
    },
    sub: {
        pageUrl: (channel) => `/subchannel.action?idSubChannel=${channel}`,
        limit: 12,
    },
    author: {
        pageUrl: (channel) => `/author/${channel}`,
        limit: 10,
    },
};

const getCookie = async (browser, tryGet) => {
    if (!cookie) {
        cookie = await tryGet('cw:cookie', async () => {
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
            });
            logger.http(`Requesting ${baseUrl}/user/get/cookie-bar`);
            await page.goto(`${baseUrl}/user/get/cookie-bar`, {
                waitUntil: 'domcontentloaded',
            });
            cookie = await getCookies(page);
            await page.close();
            return cookie;
        });
    }
    return cookie;
};

const parsePage = async (path, browser, ctx) => {
    const pageUrl = `${baseUrl}${pathMap[path].pageUrl(ctx.req.param('channel'))}`;

    const cookie = await getCookie(browser, cache.tryGet);
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });
    await setCookies(page, cookie, 'cw.com.tw');
    logger.http(`Requesting ${pageUrl}`);
    await page.goto(pageUrl, {
        waitUntil: 'domcontentloaded',
    });

    const response = await page.evaluate(() => document.documentElement.innerHTML);
    await page.close();
    const $ = load(response);

    const list = parseList($, ctx.req.query('limit') ? Number(ctx.req.query('limit')) : pathMap[path].limit);
    const items = await parseItems(list, browser, cache.tryGet);

    return { $, items };
};

const parseList = ($, limit) =>
    $('.caption')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('h3').text(),
                link: item.find('h3 a').attr('href'),
                pubDate: parseDate(item.find('time').text()),
            };
        })
        .slice(0, limit);

const parseItems = (list, browser, tryGet) =>
    Promise.all(
        list.map((item) =>
            tryGet(item.link, async () => {
                const page = await browser.newPage();
                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
                });
                await setCookies(page, cookie, 'cw.com.tw');
                logger.http(`Requesting ${item.link}`);
                await page.goto(item.link, {
                    waitUntil: 'domcontentloaded',
                });

                const response = await page.evaluate(() => document.documentElement.innerHTML);
                await page.close();
                const $ = load(response);

                const meta = JSON.parse($('head script[type="application/ld+json"]').eq(0).text());
                $('.article__head .breadcrumb, .article__head h1, .article__provideViews, .ad').remove();
                $('img.lazyload').each((_, img) => {
                    if (img.attribs['data-src']) {
                        img.attribs.src = img.attribs['data-src'];
                        delete img.attribs['data-src'];
                    }
                });

                item.title = $('head title').text();
                item.category = $('meta[name=keywords]').attr('content').split(',');
                item.pubDate = parseDate(meta.datePublished);
                item.author = meta.author.name.replace(',', ' ') || meta.publisher.name;
                item.description = $('.article__head .container').html() + $('.article__content').html();

                return item;
            })
        )
    );

module.exports = {
    baseUrl,
    pathMap,
    getCookie,
    setCookies,
    parsePage,
    parseList,
    parseItems,
};
