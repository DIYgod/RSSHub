const got = require('@/utils/got');
const date = require('@/utils/date');
const cheerio = require('cheerio');

const baseUrl = 'https://www5.ncwu.edu.cn/channels/5.html';

module.exports = async (ctx) => {
    const response = await got.get(baseUrl);
    const $ = cheerio.load(response.data);
    const list = $('div.tongzhi>div.tzlist>ul>li');

    ctx.state.data = {
        title: '华水-学校通知',
        link: baseUrl,
        item:
            list &&
            list
                .map((index, item) => ({
                    title: $(item)
                        .find('span')
                        .text(),
                    description:
                        `发自「` +
                        $(item)
                            .find('a.dw')
                            .text() +
                        `」`,
                    pubDate: date(
                        $(item)
                            .find('i')
                            .text()
                    ),
                    link:
                        baseUrl +
                        $(item)
                            .find('a[target=_blank]')
                            .attr('href'),
                }))
                .get(),
    };
};
