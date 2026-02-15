import { load } from 'cheerio';

import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getPuppeteerPage } from '@/utils/puppeteer';
import { getCookies, setCookies } from '@/utils/puppeteer-utils';

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

const getCookie = async (tryGet) => {
    if (!cookie) {
        cookie = await tryGet('cw:cookie', async () => {
            logger.http(`Requesting ${baseUrl}/user/get/cookie-bar`);
            const { page } = (await getPuppeteerPage(`${baseUrl}/user/get/cookie-bar`));
            cookie = await getCookies(page);
            await page.close();
            return cookie;
        });
    }
    return cookie;
};

const parsePage = async (path, ctx) => {
    const pageUrl = `${baseUrl}${pathMap[path].pageUrl(ctx.req.param('channel'))}`;

    logger.http(`Requesting ${pageUrl}`);
    const cookie = await getCookie(cache.tryGet);
    const { page, browser } = await getPuppeteerPage(pageUrl, { noGoto: true });
    await setCookies(page, cookie, 'cw.com.tw');
    await page.goto(pageUrl, {
        waitUntil: 'domcontentloaded',
    });

    await page.waitForSelector('.caption');
    const response = await page.evaluate(() => document.documentElement.innerHTML);
    await page.close();
    const $ = load(response);

    const list = parseList($, ctx.req.query('limit') ? Number(ctx.req.query('limit')) : pathMap[path].limit);
    const items = await parseItems(list, browser.userAgent(), cache.tryGet);

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

const parseItems = (list, ua, tryGet) =>
    Promise.all(
        list.map(async (item) =>
            await tryGet(item.link, async () => {
                const response = await ofetch(item.link, {
                    headers: {
                        Cookie: await getCookie(tryGet),
                        'User-Agent': ua,
                    },
                });
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

export { baseUrl, getCookie, parseItems, parseList, parsePage, pathMap };

export { setCookies } from '@/utils/puppeteer-utils';
