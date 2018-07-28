const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const url = `https://www.tuicool.com/mags/${id}`;
    const response = await axios({
        method: 'get',
        url: url,
        headers: {
            'User-Agent': config.ua,
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.article-title');

    ctx.state.data = {
        title: $('title').text(),
        link: 'https://www.tuicool.com/',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.title').text(),
                        description: `推酷：${item.find('.title').text()}`,
                        pubDate: new Date(
                            $('.period-title sub')
                                .text()
                                .substring(1, 11)
                        ).toUTCString(),
                        link: `${item.find('a').attr('href')}`,
                    };
                })
                .get(),
    };
};
