const cheerio = require('cheerio');
const logger = require('@/utils/logger');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { pkg, region = 'en' } = ctx.params;
    const baseUrl = 'https://apkpure.com';
    const link = `${baseUrl}/${region}/${pkg}/versions`;

    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });
    logger.debug(`Requesting ${link}`);
    await page.goto(link, {
        waitUntil: 'domcontentloaded',
    });

    const r = await page.evaluate(() => document.documentElement.innerHTML);
    browser.close();

    const $ = cheerio.load(r);
    const img = new URL($('.ver-top img').attr('src'));
    img.searchParams.delete('w'); // get full resolution icon

    const items = $('.ver li')
        .toArray()
        .map((ver) => {
            ver = $(ver);
            return {
                title: ver.find('.ver-item-n').text(),
                description: ver.html(),
                link: `${baseUrl}${ver.find('a').attr('href')}`,
                pubDate: parseDate(ver.find('.update-on').text().replace(/年|月/g, '-').replace('日', '')),
            };
        });

    ctx.state.data = {
        title: $('.ver-top-h1').text(),
        description: $('.ver-top-title p').text(),
        image: img.href,
        language: region ? region : 'en',
        link,
        item: items,
    };
};
