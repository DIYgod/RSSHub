const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const PuppeterGetter = async (ctx, browser, link) => {
    const result = await ctx.cache.tryGet(`eastmoney: ${link}`, async () => {
        const page = await browser.newPage();
        await page.goto(link);
        await page.waitForSelector('.news_list');
        const html = await page.evaluate(() => document.documentElement.innerHTML);
        return html;
    });
    return result;
};

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword;
    const url = `https://so.eastmoney.com/News/s?KeyWord=${keyword}`;

    const browser = await require('@/utils/puppeteer')();
    const response = await PuppeterGetter(ctx, browser, url);
    const $ = cheerio.load(response);
    let items = $('.news_list .news_item');

    items = items.toArray().map((item) => {
        item = $(item);
        const a = item.find('a');
        const itemTime = item.find('.news_item_time');
        const link = a.attr('href');
        const title = a.text();

        return {
            title,
            link,
            pubDate: parseDate(itemTime.text().replace(' - ', '')),
        };
    });

    ctx.state.data = {
        title: `东方财富网 - 搜索${keyword}`,
        link: url,
        item: items,
    };
};
