const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');
// const getCookie = require('../utils/pypasswaf');
// temporarily useless?

module.exports = async (ctx) => {
    const type = ctx.params.type;
    let title, path;
    switch (type) {
        case '1':
            title = '教学服务';
            path = '8230/list.htm';
            break;
        case '2':
            title = '学生培养';
            path = '8231/list.htm';
            break;
        case '3':
            title = '教学建设';
            path = '8232/list.htm';
            break;
        case '4':
            title = '教学资源';
            path = '8233/list.htm';
            break;
    }
    // const cookie = await getCookie();

    const response = await got({
        method: 'get',
        url: 'http://aao.nuaa.edu.cn/' + path,
        headers: {
            // cookie,
        },
    });

    const $ = cheerio.load(response.data);

    const list = $('.right-ul > li').slice(0, 15).get();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: '南航教务处 - ' + title,
        link: 'http://aao.nuaa.edu.cn/' + path,
        description: '南航教务处 - ' + title,
        item: result,
    };
};
