const cheerio = require('cheerio');
const got = require('@/utils/got');
const rssParser = require('@/utils/rss-parser');
const { asyncPoolAll, parseArticle } = require('./utils');

const parseAuthorNewsList = async (slug) => {
    const baseURL = `https://www.bloomberg.com/authors/${slug}`;
    const apiUrl = `https://www.bloomberg.com/lineup/api/lazy_load_author_stories?slug=${slug}&authorType=default&page=1`;
    const resp = await got(apiUrl);
    // Likely rate limited
    if (!resp.data.html) {
        return [];
    }
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
    const { id, slug, source } = ctx.params;
    const link = `https://www.bloomberg.com/authors/${id}/${slug}`;

    let list = [];
    if (!source || source === 'api') {
        list = await parseAuthorNewsList(`${id}/${slug}`);
    }
    // Fallback to rss if api failed or requested by param
    if (source === 'rss' || list.length === 0) {
        list = (await rssParser.parseURL(`${link}.rss`)).items;
    }

    const item = await asyncPoolAll(1, list, (item) => parseArticle(item, ctx));
    const authorName = item.find((i) => i.author)?.author ?? 'Unknown';

    ctx.state.data = {
        title: `Bloomberg - ${authorName}`,
        link,
        language: 'en-us',
        item,
    };
};
