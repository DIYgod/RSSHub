const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('../utils');

// 云南大学主页通知公告
module.exports = async (ctx) => {
    const host = 'http://www.ynu.edu.cn/';

    const response = await got({
        method: 'get',
        url: 'http://www.ynu.edu.cn/tzgg.htm',
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);
    const list = $('.list_cont_rigB.fl ul li')
        .slice(0, 8)
        .map((i, e) => ({
            path: $('a', e).attr('href'),
            title: $('a', e).attr('title'),
            author: '云南大学',
        }))
        .get();

    const out = await utils.processPages({ list: list, caches: ctx.cache, host: host, department: 'home' });
    ctx.state.data = {
        title: '云南大学主页通知公告',
        link: host,
        description: '云南大学主页通知公告',
        item: out,
    };
};
