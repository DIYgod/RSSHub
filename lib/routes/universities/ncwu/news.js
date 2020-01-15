const got = require('@/utils/got');
const date = require('@/utils/date');
const cheerio = require('cheerio');

const baseUrl = 'https://www5.ncwu.edu.cn/channels/4.html';

module.exports = async (ctx) => {
    const response = await got.get(baseUrl);
    const $ = cheerio.load(response.data);
    const list = $('div.xinxilist>ul>li');

    ctx.state.data = {
        title: '华水-学校新闻',
        link: baseUrl,
        item:
            list &&
            list
                .map((index, item) => ({
                    title: $(item)
                        .find('span')
                        .text(),
                    description: `详情请点击查看`,
                    pubDate: date(
                        $(item)
                            .find('i')
                            .text()
                    ),
                    link: $(item)
                        .find('a')
                        .attr('href'),
                }))
                .get(),
    };
};
