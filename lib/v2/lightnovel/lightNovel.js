const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const logger = require('@/utils/logger');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.lightnovel.us';
    const { keywords } = ctx.params;
    const cookie = '{%22security_key%22:%223cfc2dc63f3575ee42e12823188ad1b5:1709125:0%22}';

    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });

    const link = `${baseUrl}/cn/search?keywords=${keywords}`;
    logger.debug(`Requesting ${link}`);
    page.setCookie({ token: [cookie] });
    await page.goto(link, {
        waitUntil: 'domcontentloaded',
    });
    const response = await page.content();
    page.on('request', (request) => {
        request.resourceType() === 'xhr' ? request.continue() : request.abort();
    });
    page.click('btn-search');
    page.waitForNavigation();
    response.value = await page.content();
    page.close();

    const $ = cheerio.load(response);

    const list = $('.btn-search')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.text(),
                link: `${baseUrl}${a.attr('href')}`,
                pubDate: parseDate(item.find('relative-time').attr('datetime')),
                author: item.find('.opened-by a').text(),
                category: item
                    .find('a[id^=label]')
                    .toArray()
                    .map((item) => $(item).text()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                // 重用浏览器实例并打开新标签页
                const page = await browser.newPage();
                // 设置请求拦截，仅允许 HTML 请求
                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    request.resourceType() === 'document' ? request.continue() : request.abort();
                });

                logger.debug(`Requesting ${item.link}`);
                await page.goto(item.link, {
                    waitUntil: 'domcontentloaded',
                });
                const response = await page.content();
                // 获取 HTML 内容后关闭标签页
                page.close();

                const $ = cheerio.load(response);

                item.description = $('.comment-body').first().html();

                return item;
            })
        )
    );

    // 所有请求完成后关闭浏览器实例
    browser.close();

    ctx.state.data = {
        title: `1`,
        link: `${baseUrl}/cn/search?keywords=${keywords}`,
        item: items,
    };
};
