const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('../utils');

// 云南大学研究生院重要通知
module.exports = async (ctx) => {
    const host = 'http://www.grs.ynu.edu.cn/';

    const response = await got({
        method: 'get',
        url: 'http://www.grs.ynu.edu.cn/index.htm',
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);
    const list = $('#news table table tbody tr')
        .slice(0, 9)
        .map((i, e) => ({
            path: $('td a', e).attr('href'),
            title: $('td a', e).attr('title'),
            author: '研究生院',
        }))
        .get();
    const out = await utils.processPages({ list: list, caches: ctx.cache, host: host, department: 'grs' });

    ctx.state.data = {
        title: '云南大学研究生院重要通知',
        link: host + 'zytz.htm',
        description: '云南大学研究生院重要通知',
        item: out,
    };
};
