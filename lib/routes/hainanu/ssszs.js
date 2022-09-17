const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const url = 'https://ha.hainanu.edu.cn/gs/yjszs/ssszs.htm';
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.m_new13>ul>li');

    ctx.state.data = {
        title: '海南大学研究生招生',
        link: url,
        description: '海南大学研究生招生公告',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const date = item.find('span').text();
                    const pubDate = parseDate(date, 'YYYY-MM-DD');
                    return {
                        title: item.find('a').text(),
                        link: item.find('a').attr('href'),
                        pubDate,
                    };
                })
                .get(),
    };
};
