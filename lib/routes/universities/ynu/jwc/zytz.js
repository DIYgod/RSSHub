const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('../utils');

// 云南大学教务处主要通知
module.exports = async (ctx) => {
    const host = 'http://www.jwc.ynu.edu.cn/';
    const category = ctx.params.category;
    const dep = ['教务科', '学籍科', '教学研究科', '实践教学科'];

    const response = await got({
        method: 'get',
        url: 'http://www.jwc.ynu.edu.cn/',
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);
    const firstRow = category < 3 ? 0 : 1;
    const secondRow = category % 2 === 0 ? 2 : 1;

    const list = $('.index-row3')
        .eq(firstRow)
        .find('.c' + secondRow + ' .text-list ul li')
        .slice(0, 8)
        .map((i, e) => ({
            path: $('a', e).attr('href'),
            title: $('a', e).attr('title'),
            author: dep[category - 1],
        }))
        .get();

    const out = await utils.processPages({ list, caches: ctx.cache, host, department: 'jwc' });
    ctx.state.data = {
        title: '云南大学教务处' + dep[category - 1] + '通知',
        link: host,
        description: '云南大学教务处' + dep[category - 1],
        item: out,
    };
};
