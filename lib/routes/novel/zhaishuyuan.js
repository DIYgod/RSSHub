const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const url = 'https://www.zhaishuyuan.com';
    const link = `${url}/book/${id}`;
    const extendedGot = got.extend({ headers: { Referer: url }, responseType: 'buffer' });
    const response = await extendedGot.get(link);
    const html = iconv.decode(response.data, 'gb2312');
    const $ = cheerio.load(html);
    const title = $('.booktitle > h1').text();
    const description = $('#bookintro > p').text();
    const image = $('#bookimg > img').attr('src');
    const list = $('#newlist > ul > li')
        .find('a')
        .map((_, { attribs: { title, href } }) => ({ title, link: `${url}${href}` }))
        .get();
    const item = await Promise.all(
        list.map(
            async ({ title, link }) =>
                await ctx.cache.tryGet(link, async () => {
                    const browser = await require('@/utils/puppeteer')();
                    const page = await browser.newPage();
                    await page.goto(link);
                    const encoded = await page.$('#content > div > a');
                    await encoded.evaluate((encoded) => encoded.click());
                    const html = await page.evaluate(() => document.documentElement.innerHTML);
                    const $ = cheerio.load(html);
                    const content = $('#content');
                    content.find('div').remove();
                    const description = content.html();
                    const spanList = $('.title > span');
                    const author = spanList.eq(0).find('a').text();
                    const pubDate = spanList.eq(2).text();
                    return { title, link, description, author, pubDate };
                })
        )
    );
    ctx.state.data = { title, link, description, image, item };
};
