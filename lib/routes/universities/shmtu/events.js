const axios = require('../../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const host = 'http://www.shmtu.edu.cn';

    const response = await axios({
        method: 'get',
        url: host + '/events',
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);
    const text = $('tr', 'tbody')
        .slice(0, 10)
        .get();

    ctx.state.data = {
        title: '上海海事大学 学术讲座',
        link: host + '/events',
        description: '上海海事大学 学术讲座',
        item:
            text &&
            text.map((item) => {
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
                    pubDate: new Date(
                        item
                            .find('span')
                            .find('span')
                            .attr('content')
                    ).toUTCString(),
                    link: host + item.find('a').attr('href'),
                };
            }),
    };
};
