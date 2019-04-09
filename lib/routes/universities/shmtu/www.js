const axios = require('../../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const host = 'http://www.shmtu.edu.cn';
    const type = ctx.params.type;
    const info = type === 'notes' ? '通知公告' : '学术讲座';

    const response = await axios({
        method: 'get',
        url: host + `/${type}`,
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);
    const text = $('tr', 'tbody')
        .slice(0, 10)
        .get();

    ctx.state.data = {
        title: `上海海事大学 ${info}`,
        link: host + `/${type}`,
        description: '上海海事大学 官网信息',
        item:
            text &&
            text.map((item) => {
                item = $(item);
                return {
                    title: $('.title', item)
                        .text()
                        .trim(),
                    description: $('.title', item)
                        .text()
                        .trim(),
                    category: $('.department', item)
                        .text()
                        .trim(),
                    pubDate: new Date(
                        $('.date', item)
                            .find('span')
                            .find('span')
                            .attr('content')
                    ).toUTCString(),
                    link: host + item.find('a').attr('href'),
                };
            }),
    };
};
