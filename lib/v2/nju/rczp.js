const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const title_dict = {
        xxfb: '信息发布',
        jylgw: '教研类岗位',
        gllgw: '管理岗位及其他',
    };

    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    const link = `https://rczp.nju.edu.cn/sylm/${type}/index.html`;
    await page.goto(link);

    const html = await page.evaluate(() => document.querySelector('div.u-list').innerHTML);
    browser.close();

    const $ = cheerio.load(html);
    const list = $('div.item');

    ctx.state.data = {
        title: `人才招聘-${title_dict[type]}`,
        link,
        item: list
            .map((index, item) => {
                item = $(item);
                return {
                    title: item.find('a').attr('title'),
                    link: item.find('a').attr('href'),
                    pubDate: timezone(parseDate(item.find('span').first().text(), 'YYYY-MM-DD'), +8),
                };
            })
            .get(),
    };
};
