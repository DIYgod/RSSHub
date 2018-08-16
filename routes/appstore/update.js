const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const country = ctx.params.country;
    const url = `https://itunes.apple.com/${country}/app/${id}?ls=1&mt=8`;

    const res = await axios({
        method: 'get',
        url: url,
        headers: {
            'User-Agent': config.ua,
        },
    });
    const data = res.data;
    const $ = cheerio.load(data);

    const titleTags = $('h1').attr('class', 'product-header__title');
    titleTags.find('span').remove();

    const item = {};
    $('.whats-new').each(function() {
        const version = $('.whats-new__latest__version')
            .text()
            .split(' ')[1];
        item.title = titleTags.text() + version;
        item.description = $('.whats-new__content .we-truncate').text();
        item.link = url;
        item.guid = id + version;
    });

    ctx.state.data = {
        title: 'App Store 有 App 更新',
        link: url,
        item: [item],
    };
};
