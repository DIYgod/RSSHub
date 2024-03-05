// @ts-nocheck
import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
const targetUrl = 'https://ielts.neea.cn/allnews?locale=zh_CN';
import { config } from '@/config';
import puppeteer from '@/utils/puppeteer';

export default async (ctx) => {
    const html = await cache.tryGet(
        targetUrl,
        async () => {
            const browser = await puppeteer({ stealth: true });
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
            });
            await page.goto(targetUrl, {
                waitUntil: 'domcontentloaded',
            });
            await page.waitForSelector('div.container');

            const html = await page.evaluate(() => document.documentElement.innerHTML);
            browser.close();
            return html;
        },
        config.cache.routeExpire,
        false
    );

    const $ = load(html);

    const list = $('#newsListUl li')
        .get()
        .map((elem) => {
            const $elem = $(elem);
            return {
                title: $elem.find('a').text(),
                link: $elem.find('a').attr('href'),
                pubDate: timezone(parseDate($elem.find('span').eq(-1).text().replaceAll(/[[\]]/g, '').trim(), +8)),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const $ = load(detailResponse.data);
                item.description = $('.content').html();
                return item;
            })
        )
    );

    ctx.set('data', {
        title: 'IELTS雅思最新消息',
        link: targetUrl,
        item: items,
    });
};
