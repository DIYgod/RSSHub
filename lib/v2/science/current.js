// journals form AAAS publishing group
//
// science:        Science
// sciadv:         Science Advances
// sciimmunol:     Science Immunology
// scirobotics:    Science Robotics
// signaling:      Science Signaling
// stm:            Science Translational Medicine

const cheerio = require('cheerio');
const got = require('@/utils/got');
const { baseUrl, fetchDesc, getItem } = require('./utils');

module.exports = async (ctx) => {
    const { journal = 'science' } = ctx.params;
    const pageURL = `${baseUrl}/toc/${journal}/current`;

    const { data: pageResponse } = await got(pageURL, {
        headers: {
            cookie: 'cookiePolicy=iaccept;',
        },
    });
    const $ = cheerio.load(pageResponse);
    const pageTitleName = $('head > title').text();

    const list = $('.toc__section .card')
        .toArray()
        .map((item) => getItem(item, $));

    const browser = await require('@/utils/puppeteer')();
    const items = await fetchDesc(list, browser, ctx.cache.tryGet);
    await browser.close();

    ctx.state.data = {
        title: `${pageTitleName} | Current Issue`,
        description: `Current Issue of ${pageTitleName}`,
        image: `${baseUrl}/apple-touch-icon.png`,
        link: pageURL,
        language: 'en-US',
        item: items,
    };
};
