const got = require('@/utils/got');
const Cheerio = require('cheerio');
const { SUB_NAME_PREFIX, SUB_URL } = require('./const');
const loadArticle = require('./article');
const url = SUB_URL;

module.exports = async (ctx) => {
    const limit = parseInt(ctx.query.limit);
    const response = await got(url);
    const itemRaw = Cheerio.load(response.body)('ul.post-loop li.item').toArray();
    ctx.state.data = {
        title: `${SUB_NAME_PREFIX}-最新`,
        link: url,
        item:
            response.body &&
            (await Promise.all(
                (limit ? itemRaw.slice(0, limit) : itemRaw).map((e) => {
                    const { href } = Cheerio.load(e)('h2 > a')[0].attribs;
                    return ctx.cache.tryGet(href, () => loadArticle(href));
                })
            )),
    };
};
