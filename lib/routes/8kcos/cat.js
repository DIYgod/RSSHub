const got = require('@/utils/got');
const Cheerio = require('cheerio');
const { SUB_NAME_PREFIX, SUB_URL } = require('./const');
const loadArticle = require('./article');
module.exports = async (ctx) => {
    const { cat = '8kasianidol' } = ctx.params;
    const url = `${SUB_URL}category/${cat}/`;
    const resp = await got(url);
    const $ = Cheerio.load(resp.body);
    ctx.state.data = {
        title: `${SUB_NAME_PREFIX}-${$('span[property=name]:not(.hide)').text()}`,
        link: url,
        item: await Promise.all(
            $('li.item')
            .slice(0, 10)
                .map((_, e) => {
                    const { href } = Cheerio.load(e)('h2 > a')[0].attribs;
                    return ctx.cache.tryGet(href, () => loadArticle(href));
                })
                .get()
        ),
    };
};
