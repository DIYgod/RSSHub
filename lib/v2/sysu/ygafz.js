const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const logger = require('@/utils/logger');
const { CookieJar } = require('tough-cookie');

module.exports = async (ctx) => {
    const { type = 'notice' } = ctx.params;
    const baseUrl = 'https://ygafz.sysu.edu.cn';
    const url = `${baseUrl}/${type}`;

    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });

    logger.debug(`Requesting ${url}`);
    await page.goto(url, {
        waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('[data-block-plugin-id]');
    const response = await page.content();

    const cookieJar = new CookieJar();
    const cookies = await page.cookies();
    cookies.reduce((jar, cookie) => {
        jar.setCookie(`${cookie.name}=${cookie.value}`, url);
        return jar;
    }, cookieJar);

    browser.close();

    const $ = cheerio.load(response);
    const list = $('.list-content a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('p').text(),
                link: `${baseUrl}${item.attr('href')}`,
                pubDate: parseDate(item.find('.date').text()), // 2023-03-22
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data } = await got(item.link, {
                    cookieJar,
                });
                const $ = cheerio.load(data);

                item.author = $('.article-submit')
                    .text()
                    .match(/发布人：(.*)/)[1];
                item.description = $('div[data-block-plugin-id="entity_field:node:body"]').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: items,
    };
};
