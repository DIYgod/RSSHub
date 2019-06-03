const axios = require('@/utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const country = ctx.params.country;
    const url = `https://itunes.apple.com/${country}/app/${id}`;

    const res = await axios.get(url);
    const $ = cheerio.load(res.data);

    const titleTags = $('h1').attr('class', 'product-header__title');
    titleTags.find('span').remove();
    const platform = $('.we-localnav__title__product').text();

    const title = `${titleTags.text().trim()} for ${platform === 'App Store' ? 'iOS' : 'macOS'} ${country === 'cn' ? '更新' : 'Update'} `;

    const item = {};
    $('.whats-new').each(function() {
        const version = $('.whats-new__latest__version')
            .text()
            .split(' ')[1];
        item.title = `${titleTags.text().trim()} ${version}`;
        item.description = $('.whats-new__content .we-truncate').html();
        item.link = url;
        item.guid = id + version;
    });

    ctx.state.data = {
        title,
        link: url,
        item: [item],
    };
};
