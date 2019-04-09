const axios = require('../../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const host = 'http://jwc.shmtu.edu.cn';
    const type = ctx.params.type;
    const info = type === 'jiaowugonggao' ? '教务公告' : '教务新闻';

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
        description: '上海海事大学 教务信息',
        item:
            text &&
            text.map((item) => {
                item = $(item);
                return {
                    title: $('.views-field-nothing', item)
                        .text()
                        .trim(),
                    description: $('.views-field-nothing', item)
                        .text()
                        .trim(),
                    category: $('.views-field-field-xxlb', item)
                        .text()
                        .trim(),
                    pubDate: new Date(
                        $('.views-field-created', item)
                            .text()
                            .trim()
                    ).toUTCString(),
                    link:
                        host +
                        $('.views-field-nothing', item)
                            .find('a')
                            .slice(1)
                            .attr('href'),
                };
            }),
    };
};
