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

    ctx.state.data = {
        title: $("title").text(),
        link: url,
        description: $('.game-pc>p').text(),
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('p').text(),
                        description: ``,
                        pubDate: item.find('span').text(),
                        link: item.attr("href"),
                        guid: item.attr("href"),
                    };
                })
                .get(),
    };
};
