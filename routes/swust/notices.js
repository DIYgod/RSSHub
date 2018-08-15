const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    const notices = 'http://www.dean.swust.edu.cn/xml/notices/index.xml';
    const host = 'http://www.dean.swust.edu.cn';
    const response = await axios({
        method: 'get',
        url: notices,
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
        link: notices,
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
                        link: host + '/xml/notices/' + item.attr('id') + '.xml',
                    };
                })
                .get(),
    };
};
