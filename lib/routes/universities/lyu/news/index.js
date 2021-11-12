const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');
const baseUrl = 'https://www.lyu.edu.cn/';

module.exports = async (ctx) => {
    const type = ctx.params.type;
    let title, path;
    switch (type) {
        case 'ldyw':
            title = '临大要闻';
            path = '8125';
            break;
        case 'xxgg':
            title = '信息公告';
            path = '8126';
            break;
    }

    // 完整url
    const fullUrl = baseUrl + path + '/list.htm';

    const response = await got({
        method: 'get',
        url: fullUrl,
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.column-news-item').get();

    const result = await util.ProcessFeed(baseUrl, list, ctx.cache);

    ctx.state.data = {
        title: '临沂大学 - ' + title,
        link: fullUrl,
        description: '临沂大学 - ' + title,
        item: result,
    };
};
