const got = require('@/utils/got');
const Cheerio = require('cheerio');
const loadArticle = require('./article');

module.exports = async (ctx, urlParam, title) => {
    const link = new URL(urlParam, 'https://www.micmicidol.com/').toString();
    const response = await got(link);
    ctx.state.data = {
        title: `micmicidol-${title}`,
        link,
        item:
            response.body &&
            (await Promise.all(
                Cheerio.load(response.body)('.post.hentry')
                    .map((_, entry) => {
                        const { href } = Cheerio.load(entry)('.post-title.entry-title a')[0].attribs;
                        return ctx.cache.tryGet(href, () => loadArticle(href));
                    })
                    .toArray()
            )),
    };
};
