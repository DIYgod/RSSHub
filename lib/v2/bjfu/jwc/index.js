const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    let title, path;
    switch (type) {
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
        case 'jwkx':
        default:
            title = '教务快讯';
            path = 'jwkx/';
    }
    const base = 'http://jwc.bjfu.edu.cn/' + path;

    const response = await got({
        method: 'get',
        url: base,
    });

    const data = response.data; // 不用转码
    const $ = cheerio.load(data);

    const list = $('.list_c li').slice(0, 15).toArray();

    const result = await util.ProcessFeed(base, list, ctx.cache); // 感谢@hoilc指导

    ctx.state.data = {
        title: '北林教务处 - ' + title,
        link: 'http://jwc.bjfu.edu.cn/' + path,
        description: '北京林业大学教务处 - ' + title,
        item: result,
    };
};
