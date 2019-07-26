const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');

const host = 'https://www.fmprc.gov.cn/web/wjdt_674879/fyrbt_674889/';

module.exports = async (ctx) => {
    const response = await got.get(host, {
        responseType: 'buffer',
    });

    const $ = cheerio.load(response.data);

    const list = $('.rebox_news ul li').get();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: '中华人民共和国外交部-发言人表态',
        link: host,
        description: '中华人民共和国外交部-发言人表态',
        item: result,
    };
};
