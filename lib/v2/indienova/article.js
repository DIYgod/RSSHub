const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseList, parseItem } = require('./utils');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    let link = 'https://indienova.com/indie-game-news/';
    if (type === 'development') {
        link = 'https://indienova.com/indie-game-development/';
    }
    const response = await got(link);

    const $ = cheerio.load(response.data);
    const list = parseList($);

    const items = await Promise.all(list.map((item) => ctx.cache.tryGet(item.link, () => parseItem(item))));

    ctx.state.data = {
        title: $('head title').text(),
        link,
        description: '独立游戏资讯 | indienova 独立游戏',
        item: items,
    };
};
