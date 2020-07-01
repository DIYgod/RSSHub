const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    let title = '路透社 ',
        link = 'https://cn.reuters.com/news/';
    const { channel } = ctx.params;

    if (channel) {
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
                link = 'https://cn.reuters.com/';
                break;

            case 'life':
                title += '生活';
                link = 'https://cn.reuters.com/';
                break;

            default:
                break;
        }

        link += channel;
    }

    const response = await got.get(link);

    const $ = cheerio.load(response.data);

    const links = $('.inlineLinks a').map((i, e) => 'https://cn.reuters.com' + e.attribs.href);

    const items = await Promise.all(
        links.splice(0, 10).map(async (link) => {
            const single = await utils.ProcessFeed(link);

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
