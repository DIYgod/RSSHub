const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

/* 研究生招生网通知公告*/

module.exports = async (ctx) => {
    const host = 'https://yz.cuc.edu.cn';
    const link = `${host}/8549/list.htm`;
    const response = await got({
        method: 'get',
        url: link,
    });
    const $ = cheerio.load(response.data);

    const content = $('.news_list li');
    const items = content.toArray().map((elem) => {
        elem = $(elem);
        const a = elem.find('a');
        return {
            link: new URL(a.attr('href'), host).href,
            title: a.attr('title'),
            pubDate: parseDate(elem.find('.news_meta').text(), 'YYYY-MM-DD'),
        };
    });

    ctx.state.data = {
        title: $('title').text(),
        link,
        description: '中国传媒大学研究生招生网 通知公告',
        item: items,
    };
};
