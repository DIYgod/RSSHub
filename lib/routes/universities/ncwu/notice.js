const { parseDate } = require('@/utils/parse-date');
const cheerio = require('cheerio');
const baseUrl = 'https://www.ncwu.edu.cn/xxtz.htm';

module.exports = async (ctx) => {
    const list = await ctx.cache.tryGet(
        baseUrl,
        async () => {
            // 由于学校系统升级，更换为使用 puppeteer 渲染页面获取
            const browser = await require('@/utils/puppeteer')();
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' ? request.continue() : request.abort();
            });
            await page.goto(baseUrl, {
                waitUntil: 'domcontentloaded',
            });
            const html = await page.evaluate(() => document.querySelector('div.news-list').innerHTML);
            browser.close();

            const $ = cheerio.load(html);
            const list = $('div.news-item')
                .toArray()
                .map((item) => {
                    item = $(item);
                    return {
                        title: `「` + item.find('a.dw').text() + `」` + item.find('a.dw').next().text(),
                        description: item.find('div.detail').text(),
                        pubDate: parseDate(item.find('div.month').text() + '-' + item.find('div.day').text(), 'YYYY-MM-DD'),
                        link: item.find('a.dw').next().attr('href'),
                    };
                });

            return list;
        },
        60 * 60 * 12,
        false
    ); // 防止访问频率过高

    ctx.state.data = {
        title: '华水学校通知',
        link: baseUrl,
        item: list,
    };
};
