const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    const host = 'http://www.shmtu.edu.cn';

    const response = await axios({
        method: 'get',
        url: host + '/events',
        headers: {
            'User-Agent': config.ua,
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);
    const text = $('tr', 'tbody');

    ctx.state.data = {
        title: '上海海事大学 学术讲座',
        link: host + '/events',
        description: '上海海事大学 学术讲座',
        item:
            text &&
            text
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.title').text(),
                        description: '发布部门 - ' + item.find('.department').text(),
                        pubDate: item
                            .find('span')
                            .find('span')
                            .attr('content'),
                        link: host + item.find('a').attr('href'),
                    };
                })
                .get(),
    };
};
