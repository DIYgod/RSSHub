const { baseUrl, parsePage } = require('./utils');

module.exports = async (ctx) => {
    const browser = await require('@/utils/puppeteer')();

    const { $, items } = await parsePage('author', browser, ctx);

    await browser.close();

    ctx.state.data = {
        title: $('head title').text(),
        description: $('.authorTxt').text(),
        link: `${baseUrl}/author/${ctx.params.channel}`,
        image: $('.authorPhoto img').attr('src') || `${baseUrl}/assets_new/img/fbshare.jpg'`,
        language: $('meta[property="og:locale"]').attr('content'),
        item: items,
    };
};
