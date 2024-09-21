const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    let title, path;
    switch (type) {
        case 'xxtg':
            title = '信息通告';
            path = 'xxtg.htm';
            break;
        case 'xwddyn':
            title = '新闻动态';
            path = 'xwddyn.htm';
            break;
    }

    const response = await got({
        method: 'get',
        url: 'http://computer.ahau.edu.cn/xyxub/' + path,
        headers: {
            Referer: 'http://computer.ahau.edu.cn/index.htm',
        },
    });

    const $ = cheerio.load(response.data);

    const list = $('.n_right .n_listxx1 .cleafix').slice(0, 15).get();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: '安徽农业大学计算机学院 - ' + title,
        link: 'http://computer.ahau.edu.cn/xyxub/' + path,
        description: '安徽农业大学计算机学院 - ' + title,
        item: result,
    };
};
