const cheerio = require('cheerio');
const got = require('@/utils/got');
const config = require('@/config').value;

module.exports = async (ctx) => {
    if (!config.feature.allow_user_supply_unsafe_domain) {
        ctx.throw(403, `This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }
    const url = `http://${ctx.params.url}`;
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const authorInfo = $('.left-col').find('#header');
    const title = authorInfo.find('.header-author').text();
    const subtitle = authorInfo.find('.header-subtitle').text();
    const articleNodeList = $('article');
    const articles = Array.from(articleNodeList).map((article) => {
        const each = $(article);
        const titleEl = each.find('.article-title');

        return {
            title: titleEl.text(),
            link: encodeURI(`${url}${titleEl.attr('href')}`),
            description: each.find('.article-entry').text(),
            pubDate: each.find('time').attr('datetime'),
        };
    });

    ctx.state.data = {
        title,
        link: url,
        description: subtitle,
        item: articles,
    };
};
