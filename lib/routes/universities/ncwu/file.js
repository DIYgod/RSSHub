const got = require('@/utils/got');
const date = require('@/utils/date');
const cheerio = require('cheerio');

const baseUrl = 'https://www5.ncwu.edu.cn/channels/58.html';

module.exports = async (ctx) => {
    const response = await got.get(baseUrl);
    const $ = cheerio.load(response.data);
    const list = $('div.xinxilist>ul>li');

    ctx.state.data = {
        title: '华水-学校文件',
        link: baseUrl,
        item:
            list &&
            list
                .map((index, item) => ({
                    title: $(item)
                        .find('span')
                        .text(),
                    description: `文件下载请转跳详情页`,
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
