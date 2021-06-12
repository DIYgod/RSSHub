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
                    link = homePage + '/';
                    break;
                case 'life':
                    title += '生活';
                    link = homePage + '/';
                    break;
                default:
                    break;
            }
        } else if (site === 'uk') {
            title += 'UK ';
            linkSelector = '.story-content a';
            switch (channel) {
                case 'business':
                    title += 'Business';
                    link = homePage;
                    break;
                case 'markets':
                    linkSelector = '.moduleBody a, .story-content a';
                    title += 'Markets';
                    link = 'https://uk.reuters.com/business/';
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
                case 'sports':
                    linkSelector = '.story-content a, .story-title a';
                    title += 'Sport';
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
                case 'markets':
                    linkSelector = '.moduleBody a, .story-content a';
                    title += 'Markets';
                    link = 'https://www.reuters.com/finance/';
                    break;
                case 'world':
                    title += 'World';
                    break;
                case 'politics':
                    title += 'Politics';
                    link = 'https://www.reuters.com/';
                    break;
                case 'technology':
                    title += 'Tech';
                    break;
                case 'breakingviews':
                    title += 'Breakingviews';
                    link = homePage;
                    break;
                case 'wealth':
                    linkSelector = '.story-content a, .story-title a';
                    title += 'Wealth';
                    link = 'https://www.reuters.com/finance/';
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

    const links = $(linkSelector)
        .map((i, e) => homePage + e.attribs.href)
        .splice(0, 10);

    const items = await Promise.all(links.map(async (link) => await ctx.cache.tryGet(link, async () => await utils.ProcessFeed(link))));

    ctx.state.data = {
        title,
        link,
        description: title,
        item: items,
    };
};
