const cheerio = require('cheerio');
const { baseUrl, parseList, parseItems, getCookie, setCookies } = require('./utils');

module.exports = async (ctx) => {
    const pageUrl = `${baseUrl}/today`;

    const browser = await require('@/utils/puppeteer')();
    const cookie = await getCookie(browser, ctx.cache.tryGet);
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });
    await setCookies(page, cookie, 'cw.com.tw');
    await page.goto(pageUrl, {
        waitUntil: 'domcontentloaded',
    });

    const response = await page.evaluate(() => document.documentElement.innerHTML);
    await page.close();
    const $ = cheerio.load(response);

    const list = parseList($, ctx.query.limit ? Number(ctx.query.limit) : 30);
    const items = await parseItems(list, browser, ctx.cache.tryGet);

    await browser.close();

    ctx.state.data = {
        title: $('head title').text(),
        description: $('meta[name=description]').attr('content'),
        image: `${baseUrl}/assets_new/img/fbshare.jpg`,
        language: $('meta[property="og:locale"]').attr('content'),
        item: items,
    };
};
