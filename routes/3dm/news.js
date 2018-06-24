const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    const name = ctx.params.name;
    const type = ctx.params.type;
    const url = `http://www.3dmgame.com/games/${name}/${type}`;

    const response = await axios({
        method: 'get',
        url: url,
        headers: {
            'User-Agent': config.ua,
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.dowlnewslist a');
    const items = [];

    for (let i = 0; i < list.length; i++) {
        let item = $(list[i]);
        const url = item.attr('href');

        const value = await ctx.cache.get(url);
        if (value) {
            item = JSON.parse(value);
        } else {
            item = {
                title: item.find('p').text(),
                pubDate: item.find('span').text(),
                link: url,
                guid: url,
            };

            ctx.cache.set(url, JSON.stringify(item), 24 * 60 * 60);
        }

        items.push(item);
    }

    ctx.state.data = {
        title: $('title')
            .text()
            .split('_')[0],
        link: url,
        description: $('.game-pc>p').text(),
        item: items,
    };
};
