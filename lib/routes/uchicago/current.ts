// @ts-nocheck
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { getCookies, setCookies } from '@/utils/puppeteer-utils';
import logger from '@/utils/logger';
import puppeteer from '@/utils/puppeteer';

export default async (ctx) => {
    const journal = ctx.req.param('journal');
    const baseUrl = 'https://www.journals.uchicago.edu';
    const link = `${baseUrl}/toc/${journal}/current`;

    const browser = await puppeteer();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });
    logger.http(`Requesting ${link}`);
    await page.goto(link, {
        waitUntil: 'domcontentloaded',
    });
    const response = await page.evaluate(() => document.documentElement.innerHTML);
    const cookies = await getCookies(page);
    page.close();
    const $ = load(response);

    const list = $('.issue-item__title')
        .toArray()
        .map((item) => ({ link: `${baseUrl}${$(item).find('a').attr('href')}` }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const page = await browser.newPage();
                await setCookies(page, cookies, 'journals.uchicago.edu');
                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    request.resourceType() === 'document' ? request.continue() : request.abort();
                });
                logger.http(`Requesting ${item.link}`);
                await page.goto(item.link, {
                    waitUntil: 'domcontentloaded',
                    referer: link,
                });
                const response = await page.evaluate(() => document.documentElement.innerHTML);
                page.close();

                const $ = load(response);

                item.title = $('head title').text();
                item.pubDate = parseDate($('head meta[name="dc.Date"]').attr('content'));
                item.doi = $('head meta[scheme="doi"]').attr('content');
                item.author = $('.author-name span')
                    .toArray()
                    .map((author) => $(author).text())
                    .join(', ');

                $('.figure__image').each((_, elem) => {
                    if (elem.attribs['data-lg-src']) {
                        $(elem).attr('src', `${baseUrl}${elem.attribs['data-lg-src']}`);
                        delete elem.attribs['data-lg-src'];
                    }
                });

                item.description = $('.article__body').html();

                return item;
            })
        )
    );

    browser.close();

    ctx.set('data', {
        title: $('head title').text(),
        description: $('.jumbotron-journal-info').text(),
        link,
        image: $('head meta[property="og:image"]').attr('content'),
        item: items,
    });
};
