const cheerio = require('cheerio');
const url = require('url');

module.exports = async (ctx) => {
    const browser = await require('../../utils/puppeteer')();
    const page = await browser.newPage();

    const link = 'https://sspai.com/matrix';

    await page.goto(link, { waitUntil: 'networkidle2' });

    // eslint-disable-next-line no-undef
    const html = await page.evaluate(() => document.querySelector('#matrix-page > div.container > div.main').innerHTML);
    browser.close();

    const $ = cheerio.load(html);
    // const list = $('.article-card');
    const list = $('.article-card');

    ctx.state.data = {
        title: '少数派 -- Matrix',
        link,
        description: '少数派 -- Matrix',
        item: list
            .map((i, item) => ({
                title: $(item)
                    .find('.title a')
                    .text()
                    .trim(),
                description: $(item)
                    .find('.desc')
                    .text()
                    .trim(),
                link: url.resolve(
                    link,
                    $(item)
                        .find('.title a')
                        .attr('href')
                ),
                author: $(item)
                    .find('h4 a')
                    .text()
                    .trim(),
            }))
            .get(),
    };
};
