const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const host = 'http://www.shmtu.edu.cn';

    const response = await axios({
        method: 'get',
        url: host + '/notes',
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);
    const text = $('tr', 'tbody');

    ctx.state.data = {
        title: '上海海事大学 通知公告',
        link: host + '/notes',
        description: '上海海事大学 通知公告',
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
