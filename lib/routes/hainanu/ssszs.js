const got = require('@/utils/got');
const cheerio = require('cheerio');

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
                    return {
                        title: item.find('a').text(),
                        link: item.find('a').attr('href'),
                        pubDate: item.find('span').text(),
                    };
                })
                .get(),
    };
};
