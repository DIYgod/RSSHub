const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const rootUrl = 'http://news.inewsweek.cn';

module.exports = async (ctx) => {
    const channel = ctx.params.channel;
    const url = `${rootUrl}/${channel}`;
    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    await page.goto(url);
    const html = await page.evaluate(() => document.querySelector('html').innerHTML);
    browser.close();
    const $ = cheerio.load(html);

    const items = $('div.grid-item')
        .toArray()
        .map(async (item) => {
            item = $(item);
            const href = item.find('a').attr('href');
            const articleLink = `${rootUrl}${href}`;
            const browser = await require('@/utils/puppeteer')();
            const page = await browser.newPage();
            await page.goto(articleLink);
            const html = await page.evaluate(() => document.querySelector('html').innerHTML);
            browser.close();
            const $$ = cheerio.load(html);
            return {
                title: item.find('p').text(),
                description: $$('div.contenttxt').text(),
                link: articleLink,
                pubDate: parseDate(href.match('/.*/(.*)/.*')[1]),
            };
        });

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: items,
    };
};
