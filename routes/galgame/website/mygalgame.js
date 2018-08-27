const axios = require('../../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../../config');

module.exports = async (ctx) => {
    const res = await axios({
        method: 'get',
        url: 'https://www.mygalgame.com/',
        header: {
            'User-Agent': config.ua,
            Referer: 'https://www.mygalgame.com/',
        },
    });

    const data = res.data;

    const $ = cheerio.load(data);
    const list = $('#article-list').find('.article');

    ctx.state.data = {
        title: $('title').text(),
        link: 'https://www.mygalgame.com/',
        description: '忧郁的弟弟 - Galgame资源发布站',
        item:
            list &&
            list
                .slice(1)
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('h1').text(),
                        description: `${item.find('.info p').text()}`,
                        pubDate: `${item.find('.month').text()}${item.find('.day').text()}日`,
                        link: item.find('h1 a').attr('href'),
                    };
                })
                .get(),
    };
};
