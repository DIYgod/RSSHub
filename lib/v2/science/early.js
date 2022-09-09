const cheerio = require('cheerio');
const got = require('@/utils/got');

const { baseUrl, fetchDesc, getItem } = require('./utils');

module.exports = async (ctx) => {
    const { journal = 'science' } = ctx.params;
    const pageUrl = `${baseUrl}/toc/${journal}/0/0`;

    const { data: res } = await got(pageUrl, {
        headers: {
            cookie: 'cookiePolicy=iaccept;',
        },
    });
    const $ = cheerio.load(res);

    const list = $('.card-content .card-header')
        .toArray()
        .map((item) => getItem(item, $));

    const browser = await require('@/utils/puppeteer')();
    const items = await fetchDesc(list, browser, ctx.cache.tryGet);
    await browser.close();

    ctx.state.data = {
        title: $('head title').text(),
        description: $('.body02').text().trim(),
        image: `${baseUrl}/apple-touch-icon.png`,
        link: pageUrl,
        language: 'en-US',
        item: items,
    };
};
