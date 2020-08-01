const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    let title, path;
    switch (type) {
        case 'jwyw':
            title = '教务要闻';
            path = 'jwyw.htm';
            break;
        case 'tzgg':
            title = '通知公告';
            path = 'tzgg.htm';
            break;
    }

    const response = await got({
        method: 'get',
        url: 'http://jwc.ahau.edu.cn/' + path,
        headers: {
            Referer: 'http://jwc.ahau.edu.cn/jwyw.htm',
        },
    });

    const $ = cheerio.load(response.data);

    const list = $('.pageList li .clearfix').slice(0, 20).get();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: '安徽农业大学教务处 - ' + title,
        link: 'http://jwc.ahau.edu.cn/' + path,
        description: '安徽农业大学教务处 - ' + title,
        item: result,
    };
};
