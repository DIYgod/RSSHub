const cheerio = require('cheerio');
const logger = require('@/utils/logger');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.modb.pro';
    const topicId = ctx.params.id;
    const url = `${baseUrl}/topic/${topicId}`;
    const browser = await require('@/utils/puppeteer')();

    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' || request.resourceType() === 'xhr' ? request.continue() : request.abort();
    });
    logger.debug(`Requesting ${url}`);
    await page.goto(url, {
        waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('div.b-border-item');
    const response = await page.content();
    logger.info(response);
    const $ = cheerio.load(response);

    const list = $('div.b-border-item')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            const time = item.find('div.font12.flex-st span').toArray()[1];
            return {
                title: a.text(),
                link: `${baseUrl}${a.attr('href')}`,
                pubDate: timezone(parseDate($(time).text()), +8),
                author: item.find('span.emcs-name').text(),
                category: item
                    .find('a.ml4')
                    .toArray()
                    .map((item) => $(item).text()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const page = await browser.newPage();
                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    request.resourceType() === 'document' || request.resourceType() === 'script' || request.resourceType() === 'xhr' ? request.continue() : request.abort();
                });

                logger.debug(`Requesting ${item.link}`);
                await page.goto(item.link, {
                    waitUntil: 'domcontentloaded',
                });
                const response = await page.content();
                page.close();

                const $ = cheerio.load(response);

                item.description = $('div.editor-content-styl.article-style').first().html();
                return item;
            })
        )
    );
    browser.close();

    ctx.state.data = {
        title: `墨天轮合辑`,
        link: url,
        item: items,
    };
};
