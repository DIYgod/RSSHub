const got = require('@/utils/got');
const utils = require('./utils');
// const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://www.leiphone.com/site/YejieKuaixun';
    const res = await got.get(url);
    const article = (res.data || {}).article || [];

    const list = article.map((item) => item.url);
    const items = await utils.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: '雷峰网 业界资讯',
        description: '雷峰网 - 读懂智能&未来',
        link: url,
        item: items,
    };
};
