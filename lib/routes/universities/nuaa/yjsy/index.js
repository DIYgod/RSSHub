const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');
const getCookie = require('../utils/pypasswaf');
// temporarily useless?

module.exports = async (ctx) => {
    const type = ctx.params.type;
    let title, path;
    switch (type) {
        case '0':
            title = '最新动态';
            path = '2146/list.htm';
            break;
        case '1':
            title = '招生工作-动态信息';
            path = '2108/list.htm';
            break;
        case '2':
            title = '招生工作-信息服务';
            path = '2109/list.htm';
            break;
        case '3':
            title = '培养工作-动态信息';
            path = '2114/list.htm';
            break;
        case '4':
            title = '培养工作-信息服务';
            path = '2115/list.htm';
            break;
        case '5':
            title = '学位工作-动态信息';
            path = '2120/list.htm';
            break;
        case '6':
            title = '学位工作-信息服务';
            path = '2121/list.htm';
            break;
    }
    const cookie = await getCookie();

    const response = await got({
        method: 'get',
        url: 'http://www.graduate.nuaa.edu.cn/' + path,
        headers: {
            cookie,
        },
    });

    const $ = cheerio.load(response.data);

    const list = $('#news_list table[width=750] tbody tr td:nth-of-type(2)').slice(0, 15).get();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: '南航研究生院 - ' + title,
        link: 'http://www.graduate.nuaa.edu.cn/' + path,
        description: '南航研究生院 - ' + title,
        item: result,
    };
};
