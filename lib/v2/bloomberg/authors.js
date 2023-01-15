const cheerio = require('cheerio');
const { asyncPoolAll, parseArticle } = require('./utils');
const config = require('@/config').value;
const got = require('@/utils/got');
const rssParser = require('@/utils/rss-parser');
const errorMessage = 'Failed to fetch articles, likely captcha';

const parseArticleList = async (link) => {
    const response = await got(link);
    const $ = cheerio.load(response.data);
    const author = $('h1.section-front-header-module__title').text();
    const articles = $('article.story-list-story');
    if (articles.length === 0) {
        // throw error to avoid caching captcha page
        throw Error(errorMessage);
    }
    return articles
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
};

const parseArticleListCached = async (link, ctx) => {
    try {
        return await ctx.cache.tryGet(link, async () => await parseArticleList(link), config.cache.routeExpire, false);
    } catch (error) {
        if (error.message === errorMessage) {
            return [];
        } else {
            throw error;
        }
    }
};

module.exports = async (ctx) => {
    const { id, slug, source } = ctx.params;
    const link = `https://www.bloomberg.com/authors/${id}/${slug}`;

    let list = [];
    if (!source || source === 'html') {
        list = await parseArticleListCached(link, ctx);
    }
    // Fallback to rss if html scraping failed or requested by param
    if (source === 'rss' || list.length === 0) {
        list = (await rssParser.parseURL(`${link}.rss`)).items;
    }

    const item = await asyncPoolAll(1, list, (item) => parseArticle(item, ctx));
    ctx.state.data = {
        title: `Bloomberg - ${list[0]?.author}`,
        link,
        language: 'en-us',
        item,
    };
};
