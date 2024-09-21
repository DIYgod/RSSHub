const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    let title, path;
    switch (type) {
        case 'xnyw':
            title = '校内要闻';
            path = 'xnyw.htm';
            break;
        case 'xydt':
            title = '学院动态';
            path = 'xydt.htm';
            break;
    }

    const response = await got({
        method: 'get',
        url: 'http://news.ahau.edu.cn/' + path,
        headers: {
            Referer: 'http://news.ahau.edu.cn/',
        },
    });

    const $ = cheerio.load(response.data);

    const list = $('.listbox .title').slice(0, 10).get();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: '安徽农业大学新闻网 - ' + title,
        link: 'http://news.ahau.edu.cn/' + path,
        description: '安徽农业大学新闻网 - ' + title,
        item: result,
    };
};
