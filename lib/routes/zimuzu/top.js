const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { range, type } = ctx.params;

    const url = `http://www.rrys2019.com/html/top/${range}_${type}_list.html`;
    const response = await got(url);

    const $ = cheerio.load(response.data);
    const list = $('li.clearfix');

    ctx.state.data = {
        title: `${$('.title').text().trim()}-字幕组`,
        link: url,
        item: list
            .map((_, item) => {
                item = $(item);
                return {
                    title: item.find('.info a').first().text(),
                    description: item.find('.info p').first().html() + '<br>' + item.find('.a1 p').html() + '<br>' + `<img src='${item.find('.img img').first().attr('rel').replace('m_', '')}'>`,
                    link: item.find('.info a').first().attr('href'),
                };
            })
            .get(),
    };
};
