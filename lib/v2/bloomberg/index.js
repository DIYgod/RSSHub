const { rootUrl, asyncPoolAll, parseNewsList, parseArticle } = require('./utils');
const site_title_mapping = {
    '/': 'News',
    bpol: 'Politics',
    bbiz: 'Business',
    markets: 'Markets',
    technology: 'Technology',
    green: 'Green',
    wealth: 'Wealth',
    pursuits: 'Pursuits',
    bview: 'Opinion',
    equality: 'Equality',
    businessweek: 'Businessweek',
    citylab: 'CityLab',
};

module.exports = async (ctx) => {
    const { site } = ctx.params;
    const currentUrl = site ? `${rootUrl}/${site}/sitemap_news.xml` : `${rootUrl}/sitemap_news.xml`;

    const list = await parseNewsList(currentUrl, ctx);
    const items = await asyncPoolAll(1, list, (item) => parseArticle(item, ctx));
    ctx.state.data = {
        title: `Bloomberg - ${site_title_mapping[site ?? '/']}`,
        link: currentUrl,
        item: items,
    };
};
