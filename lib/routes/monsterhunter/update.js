const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://game.capcom.com/world/cn/infomation.html';

    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.version');

    ctx.state.data = {
        title: '怪物猎人更新情报',
        link: url,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('h3').text(),
                        description: item.children('div').html(),
                        link: url,
                        guid: item.find('h3').text(),
                    };
                })
                .get(),
    };
};
