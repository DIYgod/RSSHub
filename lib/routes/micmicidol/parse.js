const got = require('@/utils/got');
const Cheerio = require('cheerio');
const loadArticle = require('./article');
const url = 'https://www.micmicidol.com/';
const SUB_NAME_PREFIX = 'micmicidol';
module.exports = async (ctx, urlParam, title) => {
    const response = await got(new URL(urlParam, url).toString());
    ctx.state.data = {
        title: `${SUB_NAME_PREFIX}-${title}`,
        link: url,
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
