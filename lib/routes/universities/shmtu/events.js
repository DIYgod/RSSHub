const axios = require('../../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const host = 'https://www.shmtu.edu.cn';

    const response = await axios({
        method: 'get',
        url: host + '/events',
        headers: {
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
                        title: item
                            .find('.title')
                            .text()
                            .trim(),
                        description: item
                            .find('.title')
                            .text()
                            .trim(),
                        author:
                            '发布部门 - ' +
                            item
                                .find('.department')
                                .text()
                                .trim(),
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
