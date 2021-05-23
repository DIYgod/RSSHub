const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('../utils');

// 云南大学研究生院其他通知
module.exports = async (ctx) => {
    const host = 'http://www.grs.ynu.edu.cn/';
    const category = ctx.params.category;
    const dep = ['招生工作', '研究生培养', '质量管理', '学位工作', '综合办公室', '相关下载'];

    const response = await got({
        method: 'get',
        url: 'http://www.grs.ynu.edu.cn/index.htm',
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);
    const list = $('#con3:nth-of-type(' + category + ') ul li')
        .slice(0, 6)
        .map((i, e) => ({
            path: $('a', e).attr('href'),
            title: $('a', e).attr('title'),
            author: dep[category - 1],
        }))
        .get();
    const out = await utils.processPages({ list: list, caches: ctx.cache, host: host, department: 'grs' });
    ctx.state.data = {
        title: '云南大学研究生院' + dep[category - 1] + '通知',
        link: host,
        description: '云南大学研究生院' + dep[category - 1],
        item: out,
    };
};
