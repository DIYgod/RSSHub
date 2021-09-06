const cheerio = require('cheerio');


module.exports = async (ctx) => {
    const title = '人民网 今日头条一览';
    const link = `http://www.people.com.cn/GB/59476/index.html`;

    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    await page.goto(link);
    const html = await page.evaluate(() => document.documentElement.innerHTML);

    const $ = cheerio.load(html);
    const list = $('body > table:nth-child(2) > tbody > tr > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > table:nth-child(2) > tbody > tr > td > *')
        .slice(0, 20)
        .map(function () {
            const link = $(this).find('a').attr('href') || $(this).attr('href');
            return link;
        })
        .filter((e) => !!e)
        .get();

    const out = await Promise.all(
        list.map(async (itemUrl) => {
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const page = await browser.newPage();
            await page.goto(itemUrl);
            const html = await page.evaluate(() => document.documentElement.innerHTML);
            const $ = cheerio.load(html);
            const title = $('body > div.main > div.layout.rm_txt.cf > div.col.col-1 > h1').html().trim();
            const description = $('body > div.main > div.layout.rm_txt.cf > div.col.col-1').html().trim();

            const single = {
                title,
                link: itemUrl,
                description,
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    browser.close();

    ctx.state.data = {
        title,
        link,
        item: out,
    };
};
