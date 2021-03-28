const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const groupid = ctx.params.groupid;
    const type = ctx.params.type;

    const url = `https://www.douban.com/group/${groupid}/${type ? `?type=${type}` : ''}`;
    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    await page.goto(url);
    const html = await page.evaluate(() => document.documentElement.innerHTML);

    const $ = cheerio.load(html);
    const list = $('.olt tr:not(.th)').slice(0, 30).get();

    const items = await Promise.all(
        list.map(async (item) => {
            const $1 = $(item);
            const result = {
                title: $1.find('.title a').attr('title'),
                author: $1.find('a').eq(1).text(),
                link: $1.find('.title a').attr('href'),
            };
            return await ctx.cache.tryGet(result.link, async () => {
                try {
                    await page.goto(result.link);
                    const html = await page.evaluate(() => document.documentElement.innerHTML);
                    const $ = cheerio.load(html);
                    result.pubDate = $('.create-time').text();
                    result.description = $('.rich-content').html();
                    return result;
                } catch (error) {
                    return result;
                }
            });
        })
    );
    browser.close();


    ctx.state.data = {
        title: `豆瓣小组-${$('h1').text().trim()}`,
        link: url,
        item: items,
    };
};
