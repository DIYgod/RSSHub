const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');
const validUrl = require('valid-url');

module.exports = async (ctx) => {
    const { site } = ctx.params || 'cn';

    let homePage = '';

    if ( site === 'cn' ) {
        homePage = 'https://cn.reuters.com';
    } else if ( site === 'us' ) {
        homePage = 'https://www.reuters.com';
    } else {
        return;
    }

    let title = 'Reuters ',
        link = '',
        linkSelector = '';

    const { channel } = ctx.params;

    if ( !channel ) {
        return;
    }

    if ( site === 'cn' ) {
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
    } else if ( site === 'us' ) {
        linkSelector = '.StoryCollection__hero___1YMlPw a, .StoryCollection__story___3EY8PG a';
        switch (channel) {
            case 'world':
                title += 'World';
                break;
            case 'business':
                title += 'Business';
                break;
            case 'legal':
                linkSelector = '.StaticMediaMaximizer__hero___3tmwgq a, .StaticMediaMaximizer__cards___2xyS1_ a';
                title += "Legal";
                break;
            case 'markets':
                linkSelector = '.moduleBody a, .story-content a';
                title += 'Markets';
                break;
            case 'breakingviews':
                title += 'Breakingviews';
                break;
            case 'technology':
                title += 'Tech';
                break;
            case 'investigates':
                linkSelector = '.section-article-container a';
                title += 'Investigates';
                break;
            case 'lifestyle':
                title += 'Lifestyle';
                break;
            default:
                break;
        }
        link = homePage + '/' + channel + '/';
    }

    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const links = $(linkSelector)
        .map((i, e) => {
            if (validUrl.isUri(e.attribs.href)) {
                return e.attribs.href;
            } else {
                return homePage + e.attribs.href;
            }
         })
        .splice(0, 10);

    const items = await Promise.all(links.map(async (link) => await ctx.cache.tryGet(link, async () => await utils.ProcessFeed(link))));

    ctx.state.data = {
        title,
        link,
        description: title,
        item: items,
    };
};
