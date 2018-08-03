const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    const host = 'http://eecs.pku.edu.cn/';

    let type = ctx.params && ctx.params.type;
    if (type === undefined) {
        type = '0';
    }

    const response = await axios({
        method: 'get',
        url: host + 'Survey/Notice/?Mtitle=' + type,
        headers: {
            'User-Agent': config.ua,
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);
    const text = $('.hvr-shutter-out-vertical');

    ctx.state.data = {
        title: '',
        link: host + 'Survey/Notice/?Mtitle=' + type,
        description: '北大信科 公告通知',
        item:
            text &&
            text
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('p').text(),
                        link: host + item.attr('href'),
                        description: item.find('p').text(),
                        pubDate: item.find('em').text(),
                    };
                })
                .get(),
    };
};
