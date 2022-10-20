const { rootUrl, parseNewsList, parseArticle } = require('./utils');
const asyncPool = require('tiny-async-pool');

const site_title_mapping = {
    '/': 'News',
    bpol: 'Politics',
};

const asyncPoolAll = async (...args) => {
    const results = [];
    for await (const result of asyncPool(...args)) {
        results.push(result);
    }
    return results;
};

module.exports = async (ctx) => {
    const { site } = ctx.params;
    const currentUrl = `${rootUrl}/${site}/sitemap_news.xml`;

    const list = await parseNewsList(currentUrl, ctx);
    const items = await asyncPoolAll(5, list, (item) => parseArticle(item, ctx));
    ctx.state.data = {
        title: site_title_mapping[site],
        link: currentUrl,
        item: items,
    };
};
