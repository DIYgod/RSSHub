const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');
const iconv = require('iconv-lite'); // 转码

module.exports = async (ctx) => {
    const type = ctx.params.type;
    let title, path;
    switch (type) {
        case 'kydt':
            title = '科研动态';
            path = 'kyxz/kydt/';
            break;
        case 'pydt':
            title = '本科生培养';
            path = 'bkspy/pydt/';
            break;
        case 'pydt2':
            title = '研究生培养';
            path = 'yjspy/pydt2/';
            break;
        default:
            title = '学院新闻';
            path = 'xyxw/';
    }
    const base = 'http://it.bjfu.edu.cn/' + path;

    const response = await got({
        method: 'get',
        responseType: 'buffer', // 转码
        url: base,
    });

    const data = iconv.decode(response.data, 'gb2312'); // 转码
    const $ = cheerio.load(data);

    // const list = $('div[item-content]').slice(0, 10).get();

    const list = $('.item-content').get();

    const result = await util.ProcessFeed(base, list, ctx.cache); // 感谢@hoilc指导

    ctx.state.data = {
        title: '北林信息 - ' + title,
        link: 'http://it.bjfu.edu.cn/' + path,
        description: '北京林业大学信息学院 - ' + title,
        item: result,
    };
};
