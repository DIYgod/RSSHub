const cheerio = require('cheerio');
const config = require('@/config').value;
const { parseDate } = require('@/utils/parse-date');
const logger = require('@/utils/logger');
// /iqiyi/user/video/:uid
// http://localhost:1200/iqiyi/user/video/2289191062
module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const link = `https://www.iqiyi.com/u/${uid}/videos`;

    // Use puppeteer because iqiyi page has a delay.
    const browser = await require('@/utils/puppeteer')();
    const data = await ctx.cache.tryGet(
        link,
        async () => {
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
            });
            logger.debug(`Requesting ${link}`);
            await page.goto(link, {
                waitUntil: 'domcontentloaded',
            });
            await page.waitForSelector('li.pic-txt-li');
            const html = await page.content();

            const $ = cheerio.load(html);
            const list = $('li.pic-txt-li');

            return {
                title: $('title').text(),
                link,
                item:
                    list &&
                    list
                        .map((index, item) => ({
                            title: $(item).attr('title'),
                            // description: `<img src="${$(item).find('.li-pic img').attr('src')}">`,
                            pubDate: parseDate($(item).find('.li-sub span.sub-date').text(), 'YYYY-MM-DD'),
                            link: $(item).find('.li-dec a').attr('href'),
                        }))
                        .get(),
            };
        },
        config.cache.routeExpire,
        false
    );
    browser.close();

    ctx.state.data = data;
};
