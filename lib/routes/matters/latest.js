const cheerio = require('cheerio');
const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const browser = await require('../../utils/puppeteer')();
    const page = await browser.newPage();

    const link = `https://matters.news`;

    await page.goto(link);
    await page.click('.sort-button');
    await page.waitFor(3000);
    const html = await page.evaluate(() => page.querySelector('ul').innerHTML);
    browser.close();

    const $ = cheerio.load(html);
    const list = $('section.jsx-1110843272.container').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const time = $('time').attr('datetime');
            const title = $('h2.jsx-71409154.feed').text();
            const postfix = encodeURI($('a.jsx-1110843272').attr('href'));
            const address = `https://matters.news${postfix}`;
            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                pubDate: new Date(time).toUTCString(),
                link: address,
                guid: address,
            };
            proList.push(axios.get(address));
            indexList.push(i);
            return Promise.resolve(single);
        })
    );
    const responses = await axios.all(proList);
    for (let i = 0; i < responses.length; i++) {
        const res = responses[i];
        const $ = cheerio.load(res.data);
        out[indexList[i]].description = $('.jsx-2372748515.u-content').html();
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]), 24 * 60 * 60);
    }

    ctx.state.data = {
        title: 'Matters | 最新文章',
        link,
        item: out,
    };
};
