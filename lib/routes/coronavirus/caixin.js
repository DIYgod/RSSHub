const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://m.app.caixin.com/m_topic_detail/1473.html',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('li.photo');

    ctx.state.data = {
        title: '武汉肺炎防疫全纪录-财新网',
        description: $('.lead').html(),
        link: 'http://m.app.caixin.com/m_topic_detail/1473.html',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('dt').text(),
                        description: item.find('dd').html(),
                        link: item.find('a').attr('href'),
                        pubDate: date(item.find('em').text()),
                    };
                })
                .get(),
    };
};
