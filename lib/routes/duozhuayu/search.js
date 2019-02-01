const puppeteer = require('../../utils/puppeteer');
const cheerio = require('cheerio');

module.exports = async (ctx, next) => {
    const wd = ctx.params.wd;
    const link = `https://www.duozhuayu.com/search/${wd}`;
    const browser = await puppeteer();
    const page = await browser.newPage();

    await page.goto(link, { waitUntil: 'networkidle0' });
    // eslint-disable-next-line no-undef
    const html = await page.evaluate(() => document.querySelector('html').innerHTML);
    browser.close();
    const $ = cheerio.load(html);
    const books = $('.Search-section')
        .eq(1)
        .find('.SearchBookItem');
    const item = books
        .map((index, i) => {
            const book = $(i);
            const text = book.find('.SearchBookItem-title').text() + ' - ' + book.find('.SearchBookItem-description').text() + ' - ' + book.find('.Price').text();
            return {
                title: text,
                link: `https://www.duozhuayu.com${book.attr('href')}`,
                description: book.html(),
                guid: `https://www.duozhuayu.com${book.attr('href')}${book.find('.Price').text()}`,
            };
        })
        .get();
    ctx.state.data = {
        title: `多抓鱼搜索-${wd}`,
        link,
        description: `多抓鱼搜索-${wd}`,
        item,
    };
    await next();
};
