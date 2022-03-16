const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const country = ctx.params.country;
    const url = `https://apps.apple.com/${country}/app/${id}`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);

    const titleTags = $('h1').attr('class', 'product-header__title');
    titleTags.find('span').remove();
    const platform = $('.we-localnav__title__product').text();

    const title = `${titleTags.text().trim()} for ${platform === 'App Store' ? 'iOS' : 'macOS'} ${country === 'cn' ? '更新' : 'Update'}`;

    const items = [];
    if ($('.whats-new').length > 0) {
        $('.whats-new').each(() => {
            const version = $('.whats-new__latest__version').text().split(' ')[1];
            const date = $('.whats-new__content time').attr('aria-label');
            const item = {};
            item.title = `${titleTags.text().trim()} ${version}`;
            item.description = $('.whats-new__content .we-truncate').html();
            item.link = url;
            item.guid = id + version;
            item.pubDate = date;
            items.push(item);
        });
    }
    ctx.state.data = {
        title,
        link: url,
        item: items,
    };
};
