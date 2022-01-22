const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const todo = ctx.params.do ?? '';
    const keyword = ctx.params.keyword ?? '';
    const rootUrl = 'https://www.leiphone.com';
    const url = `${rootUrl}${todo}${keyword}`;
    const res = await got.get(url);
    const $ = cheerio.load(res.data);

    const list = $('.word > h3 > a')
        .slice(0, 10)
        .get()
        .map((e) => $(e).attr('href'));
    const items = await utils.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: `雷峰网${todo === 'category' ? ` ${keyword}` : ''}`,
        description: '雷峰网 - 读懂智能&未来',
        link: url,
        item: items,
    };
};
