const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    const name = ctx.params.name;
    const type = 'download';
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
    const list = $('.ZQ_Left .Llis_4 li');
    const items = [];

    for (let i = 0; i < list.length; i++) {
        let item = $(list[i]);
        const url = item.find('.bt').attr('href');

        const value = await ctx.cache.get(url);
        if (value) {
            item = JSON.parse(value);
        } else {
            item = {
                title: item.find('.bt').text(),
                pubDate: item.find('p').text(),
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
        item: items,
    };
};
