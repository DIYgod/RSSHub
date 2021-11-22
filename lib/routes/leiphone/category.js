const got = require('@/utils/got');
const utils = require('./utils');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { catname } = ctx.params;
    const url = `https://www.leiphone.com/category/${catname}`;
    const res = await got.get(url);
    const $ = cheerio.load(res.data);

    const list = $('.word > h3 > a')
        .slice(0,10)
        .get()
        .map((e) => $(e).attr('href'));
    const items = await utils.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: `雷峰网 ${catname}`,
        description: '雷峰网 - 读懂智能&未来',
        link: url,
        item: items,
    };
};