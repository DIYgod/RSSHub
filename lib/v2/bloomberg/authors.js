const cheerio = require('cheerio');
const got = require('@/utils/got');
const { asyncPoolAll, parseArticle } = require('./utils');

const parseAuthorNewsList = async (slug) => {
    const baseURL = `https://www.bloomberg.com/authors/${slug}`;
    const apiUrl = `https://www.bloomberg.com/lineup/api/lazy_load_author_stories?slug=${slug}&authorType=default&page=1`;
    const resp = await got(apiUrl);
    const $ = cheerio.load(resp.data.html);
    const articles = $('article.story-list-story');
    return articles
        .map((index, item) => {
            item = $(item);
            const headline = item.find('a.story-list-story__info__headline-link');
            return {
                title: headline.text(),
                pubDate: item.attr('data-updated-at'),
                guid: `bloomberg:${item.attr('data-id')}`,
                link: new URL(headline.attr('href'), baseURL).href,
            };
        })
        .get();
};

module.exports = async (ctx) => {
    const { id, slug } = ctx.params;
    const list = await parseAuthorNewsList(`${id}/${slug}`);
    const item = await asyncPoolAll(1, list, (item) => parseArticle(item, ctx));

    let authorName = 'Unknown';
    for (const i of item) {
        if (i.author) {
            authorName = item.author;
            break;
        }
    }

    ctx.state.data = {
        title: `Bloomberg - ${authorName}`,
        link: `https://www.bloomberg.com/authors/${id}/${slug}`,
        language: 'en-us',
        item,
    };
};
