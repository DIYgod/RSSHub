const cheerio = require('cheerio');
const url = require('url');

module.exports = async (ctx) => {
    const browser = await require('../../utils/puppeteer')();
    const page = await browser.newPage();

    const link = 'https://sspai.com/series';

    await page.goto(link);

    // eslint-disable-next-line no-undef
    const html = await page.evaluate(() => document.querySelector('div.new-series-wrapper').innerHTML);
    browser.close();

    const $ = cheerio.load(html);
    const list = $('div.item');

    ctx.state.data = {
        title: '少数派 -- 最新上架付费专栏',
        link,
        description: '少数派 -- 最新上架付费专栏',
        item: list
            .map((i, item) => ({
                title: $(item)
                    .find('.item-title a')
                    .text()
                    .trim(),
                link: url.resolve(
                    link,
                    $(item)
                        .find('.item-title a')
                        .attr('href')
                ),
                author: $(item)
                    .find('.item-author')
                    .text()
                    .trim(),
            }))
            .get(),
    };
};
