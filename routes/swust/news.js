const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    const news = 'http://www.dean.swust.edu.cn/xml/news/index.xml';
    const host = 'http://www.dean.swust.edu.cn';
    const response = await axios({
        method: 'get',
        url: news,
        headers: {
            'User-Agent': config.ua,
            Referer: host,
        },
    });

    const data = response.data;

    const $ = cheerio.load(data, {
        xmlMode: true,
    });
    const list = $('entrity');

    ctx.state.data = {
        title: $('title')
            .first()
            .text(),
        link: news,
        description: $('title')
            .first()
            .text(),
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('title').text(),
                        description: item.find('summary').text(),
                        pubDate: item.find('date').text(),
                        link: host + '/xml/news/' + item.attr('id') + '.xml',
                    };
                })
                .get(),
    };
};
