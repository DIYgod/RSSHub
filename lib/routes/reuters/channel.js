const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const { site } = ctx.params || 'cn';
    const homePage = `https://${site === 'us' ? 'www' : site}.reuters.com`;

    let title = 'Reuters ',
        link = `https://${site === 'us' ? 'www' : site}.reuters.com/news/`,
        linkSelector;

    const { channel } = ctx.params;

    if (channel) {
        if (site === 'cn') {
            title = '路透社 ';
            linkSelector = '.inlineLinks a';
            switch (channel) {
                case 'china':
                    title += '中国财经';
                    break;
                case 'internationalbusiness':
                    title += '国际财经';
                    break;
                case 'newsmaker':
                    title += '新闻人物';
                    break;
                case 'opinions':
                    title += '财经视点';
                    break;
                case 'analyses':
                    title += '深度分析';
                    break;
                case 'generalnews':
                    title += '时事要闻';
                    break;
                case 'CnColumn':
                    title += '中国财经专栏';
                    break;
                case 'ComColumn':
                    title += '大宗商品专栏';
                    break;
                case 'IntColumn':
                    title += '国际财经专栏';
                    break;
                case 'investing':
                    title += '投资';
                    link = homePage;
                    break;
                case 'life':
                    title += '生活';
                    link = homePage;
                    break;
                default:
                    break;
            }
        } else if (site === 'uk') {
            linkSelector = '.story-content a';
            switch (channel) {
                case 'business':
                    title += 'Business';
                    link = homePage;
                    break;
                case 'world':
                    title += 'World';
                    break;
                case 'uk':
                    title += 'UK';
                    break;
                case 'technology':
                    title += 'Tech';
                    break;
                case 'personalFinance':
                    title += 'Money';
                    link = 'https://uk.reuters.com/business';
                    break;
                case 'breakingviews':
                    title += 'Breakingviews';
                    link = homePage;
                    break;
                case 'lifestyle':
                    title += 'Life';
                    break;
                default:
                    break;
            }
        } else if (site === 'us') {
            linkSelector = '.story-content a';
            switch (channel) {
                case 'business':
                    title += 'Business';
                    link = homePage;
                    break;
                case 'world':
                    title += 'World';
                    break;
                case 'uk':
                    title += 'UK';
                    break;
                case 'technology':
                    title += 'Tech';
                    break;
                case 'personalFinance':
                    title += 'Money';
                    link = 'https://uk.reuters.com/business';
                    break;
                case 'breakingviews':
                    title += 'Breakingviews';
                    link = homePage;
                    break;
                case 'lifestyle':
                    title += 'Life';
                    break;
                default:
                    break;
            }
        }
        link += channel;
    }

    const response = await got.get(link);

    const $ = cheerio.load(response.data);

    const links = $(linkSelector).map((i, e) => homePage + e.attribs.href);

    const items = await Promise.all(
        links.splice(0, 10).map(async (link) => {
            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const single = await utils.ProcessFeed(link);
            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title,
        link,
        description: title,
        item: items,
    };
};
