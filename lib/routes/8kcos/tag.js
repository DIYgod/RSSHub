const got = require('@/utils/got');
const Cheerio = require('cheerio');
const { SUB_NAME_PREFIX, SUB_URL } = require('./const');
const loadArticle = require('./article');
module.exports = async (ctx) => {
    const limit = parseInt(ctx.query.limit);
    const { tag } = ctx.params;
    const url = `${SUB_URL}tag/${tag}/`;
    const resp = await got(url);
    const $ = Cheerio.load(resp.body);
    const itemRaw = $('li.item').toArray();

    ctx.state.data = {
        title: `${SUB_NAME_PREFIX}-${$('span[property=name]:not(.hide)').text()}`,
        link: url,
        item: await Promise.all(
            (limit ? itemRaw.slice(0, limit) : itemRaw).map((e) => {
                const { href } = Cheerio.load(e)('h2 > a')[0].attribs;
                return ctx.cache.tryGet(href, () => loadArticle(href));
            })
        ),
    };
};
