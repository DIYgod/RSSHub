const date = require('@/utils/date');
const cheerio = require('cheerio');
const baseUrl = 'https://www5.ncwu.edu.cn/channels/5.html';

module.exports = async (ctx) => {
    const htmlCache = await ctx.cache.tryGet(
        baseUrl,
        async () => {
            // 由于学校系统升级，更换为使用 puppeteer 渲染页面获取
            const browser = await require('@/utils/puppeteer')();
            const page = await browser.newPage();
            await page.goto(baseUrl);
            const html = await page.evaluate(
                () =>
                    // eslint-disable-next-line no-undef
                    document.querySelector('div.news-list').innerHTML
            );
            browser.close();

            return html;
        },
        60 * 60 * 12
    ); // 防止访问频率过高

    const $ = cheerio.load(htmlCache);
    const list = $('div.news-item');

    ctx.state.data = {
        title: '华水学校通知',
        link: baseUrl,
        item:
            list &&
            list
                .map((index, item) => ({
                    title: `「` + $(item).find('a.dw').text() + `」` + $(item).find('a.dw').next().text(),
                    description: $(item).find('div.detail').text(),
                    pubDate: date($(item).find('div.month').text() + '-' + $(item).find('div.day').text()),
                    link: $(item).find('a.dw').next().attr('href'),
                }))
                .get(),
    };
};
