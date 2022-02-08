const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const browser = await require('@/utils/puppeteer')();

    async function requestData(url) {
        const page = await browser.newPage();
        await page.goto(url);
        await page.waitForSelector('body > section');
        const html = await page.evaluate(() => document.documentElement.innerHTML);
        return html;
    }

    const baseUrl = 'https://www.acwifi.net/page/1';
    const html = await requestData(baseUrl);
    const $ = cheerio.load(html);
    const list = $('article > header > h2').get();

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);
        return {
            desc: $('article.article-content').html(),
        };
    };

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const $a = $('a');
            const link = $a.attr('href');

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const html = await requestData(link);
            const feed = ProcessFeed(html);
            const description = feed.desc;

            const single = {
                title: $a.text(),
                description,
                link,
            };
            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    browser.close();
    ctx.state.data = { title: '路由器交流', link: baseUrl, item: out };
};
