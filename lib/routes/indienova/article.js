const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'https://www.indienova.com/indie-game-news/',
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.article-panel');

    ctx.state.data = {
        title: 'INDIENOVA',
        link: 'https://www.indienova.com/indie-game-news/',
        description: '独立游戏资讯 | indienova 独立游戏',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('h4').text(),
                        description: item.find('p').text() + '<img src="' + item.find('img').attr('src') + '">',
                        link:
                            'https://www.indienova.com' +
                            item
                                .find('.article-image')
                                .find('a')
                                .attr('href'),
                    };
                })
                .get(),
    };
};
