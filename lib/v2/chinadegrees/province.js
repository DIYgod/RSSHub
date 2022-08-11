const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const config = require('@/config').value;
const baseUrl = 'http://www.chinadegrees.com.cn';

module.exports = async (ctx) => {
    const { province = '11' } = ctx.params;
    const url = `${baseUrl}/help/unitSwqk${province}.html`;

    const data = await ctx.cache.tryGet(
        url,
        async () => {
            const browser = await require('@/utils/puppeteer')();
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
            });
            await page.goto(url, {
                waitUntil: 'domcontentloaded',
            });
            await page.waitForSelector('.datalist');

            const html = await page.evaluate(() => document.documentElement.innerHTML);
            await browser.close();

            const $ = cheerio.load(html);
            return {
                title: $('caption').text().trim(),
                items: $('.datalist tr')
                    .toArray()
                    .slice(1)
                    .map((item) => {
                        item = $(item);
                        const title = item.find('td').eq(1).text();
                        const pubDate = item.find('td').eq(2).text();
                        return {
                            title,
                            pubDate,
                            guid: `${title}:${pubDate}`,
                        };
                    })
                    .filter((item) => item.title !== 'null'),
            };
        },
        config.cache.routeExpire,
        false
    );

    const items = data.items.map((item) => {
        item.description = art(path.join(__dirname, 'templates/description.art'), {
            title: item.title,
            pubDate: item.pubDate,
        });
        item.pubDate = parseDate(item.pubDate, 'YYYY-MM-DD');
        return item;
    });

    ctx.state.data = {
        title: data.title,
        link: url,
        item: items,
    };
};
