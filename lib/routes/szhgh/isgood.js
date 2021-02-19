const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://www.szhgh.com/html/isgood/',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.list_section li');

    ctx.state.data = {
        title: '红歌会网-推荐文章',
        link: 'http://www.szhgh.com/html/isgood/',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.title a').first().text(),
                        description: `${item.find('.author').last().text()}<br>时间：${item.find('.newstime').text()}`,
                        link: item.find('.title a').attr('href'),
                    };
                })
                .get(),
    };
};