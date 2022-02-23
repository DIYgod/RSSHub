const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    let title, path;
    switch (type) {
        case 'xygg':
            title = '学院公告';
            path = '1651';
            break;
        case 'xyxw':
            title = '学院新闻';
            path = '1652';
            break;
        case 'xszx':
            title = '学生资讯';
            path = '1659';
            break;
    }
    const base = 'http://ceai.njnu.edu.cn/Item/List.asp?ID=' + path;

    const response = await got({
        method: 'get',
        url: base,
        https: {
            rejectUnauthorized: false,
        },
    });

    const $ = cheerio.load(response.data);

    const list = $('span a').get();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: '南京师范大学计电人院 - ' + title,
        link: 'http://ceai.njnu.edu.cn/',
        description: '南京师范大学计电人院',
        item: result,
    };
};
