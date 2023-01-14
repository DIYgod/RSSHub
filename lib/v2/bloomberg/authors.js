const cheerio = require('cheerio');
const { asyncPoolAll, parseArticle } = require('./utils');
const got = require('@/utils/got');

const parseArticleList = async (link, ctx) =>
    await ctx.cache.tryGet(link, async () => {
        const response = await got(link);
        const $ = cheerio.load(response.data);
        const author = $('h1.section-front-header-module__title').text();
        return $('article.story-list-story')
            .map((index, item) => {
                item = $(item);
                const headline = item.find('a.story-list-story__info__headline-link');
                return {
                    title: headline.text(),
                    author,
                    pubDate: item.attr('data-updated-at'),
                    guid: `bloomberg:${item.attr('data-id')}`,
                    link: new URL(headline.attr('href'), link).href,
                };
            })
            .get();
    });

module.exports = async (ctx) => {
    const { id, slug } = ctx.params;
    const link = `https://www.bloomberg.com/authors/${id}/${slug}`;
    const list = await parseArticleList(link, ctx);
    const item = await asyncPoolAll(1, list, (item) => parseArticle(item, ctx));
    ctx.state.data = {
        title: `Bloomberg - ${list[0]?.author}`,
        link,
        language: 'en-us',
        item,
    };
};
