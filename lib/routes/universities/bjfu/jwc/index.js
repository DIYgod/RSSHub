const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');
const iconv = require('iconv-lite'); // 转码

module.exports = async (ctx) => {
    const type = ctx.params.type;
    let title, path;
    switch (type) {
        case 'jwkx':
            title = '教务快讯';
            path = 'jwkx/';
            break;
        case 'jgdt':
            title = '教改动态';
            path = 'jgdt/';
            break;
        case 'ksxx':
            title = '考试信息';
            path = 'ksxx/';
            break;
        case 'kcxx':
            title = '课程信息';
            path = 'tkxx/';
            break;
        case 'tpxw':
            title = '图片新闻';
            path = 'tpxw/';
            break;
        default:
            title = '教务快讯';
            path = 'jwkx/';
    }
    const base = 'http://jwc.bjfu.edu.cn/' + path;

    const response = await got({
        method: 'get',
        responseType: 'buffer', // 转码
        url: base,
    });

    const data = iconv.decode(response.data, 'gb2312'); // 转码
    const $ = cheerio.load(data);

    const list = $('.list_c li').slice(0, 10).get();

    const result = await util.ProcessFeed(base, list, ctx.cache); // 感谢@hoilc指导

    ctx.state.data = {
        title: '北林教务处 - ' + title,
        link: 'http://jwc.bjfu.edu.cn/' + path,
        description: '北京林业大学教务处 - ' + title,
        item: result,
    };
};
