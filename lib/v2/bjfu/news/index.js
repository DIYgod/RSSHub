const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    let title, path;
    switch (type) {
        case 'lsyw':
            title = '绿色要闻';
            path = 'lsyw/';
            break;
        case 'xydt':
            title = '校园动态';
            path = 'lsxy/';
            break;
        case 'jxky':
            title = '教学科研';
            path = 'jxky/';
            break;
        case 'djsz':
            title = '党建思政';
            path = 'djsz/';
            break;
        case 'yzph':
            title = '一周排行';
            path = 'yzph/';
            break;
        default:
            title = '绿色要闻';
            path = 'lsyw/';
    }
    const base = 'http://news.bjfu.edu.cn/' + path;

    const response = await got({
        method: 'get',
        url: base,
    });

    const data = response.data; // 不用转码
    const $ = cheerio.load(data);

    const list = $('.news_ul li').slice(0, 10).get();

    const result = await util.ProcessFeed(base, list, ctx.cache); // 感谢@hoilc指导

    ctx.state.data = {
        title: '北林新闻- ' + title,
        link: 'http://news.bjfu.edu.cn/' + path,
        description: '绿色新闻网 - ' + title,
        item: result,
    };
};
