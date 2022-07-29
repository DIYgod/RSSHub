const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const rootURL = 'https://www.cmde.org.cn';

module.exports = async (ctx) => {
    const cate = ctx.params.cate ?? 'xwdt/zxyw';
    const link = `${rootURL}/${cate}/`;

    const browser = await require('@/utils/puppeteer')({ stealth: true });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });
    await page.goto(link);
    await page.waitForSelector('.child-list .list ul');
    const html = await page.evaluate(() => document.querySelector('.child-list .list ul').innerHTML);
    const title = await page.evaluate(() => document.title);
    browser.close();

    const $ = cheerio.load(html);
    const list = $('li');

    const data = {
        title,
        link,
        item: list
            .map((_, item) => ({
                title: $(item).find('a').attr('title'),
                link: new URL($(item).find('a').attr('href'), link).href,
                pubDate: parseDate($(item).find('span:last-child').text().replace(/\(|\)/g, '')),
            }))
            .get(),
    };

    ctx.state.data = data;

    ctx.state.json = {
        title: data.title,
        link: data.link,
        item: data.item.map((item) => item.title),
    };
};
