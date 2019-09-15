const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.huodongxing.com/eventlist',
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const list = $('div.search-tab-content-item');

    ctx.state.data = {
        title: '活动行',
        link: 'https://www.huodongxing.com/eventlist',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item
                            .find('.item-title')
                            .text()
                            .trim(),
                        link: item.find('.item-title').attr('href'),
                        description:
                            item.find('.item-data').text() +
                            ' ' +
                            item
                                .find('.item-dress')
                                .text()
                                .trim(),
                        author: item
                            .find('.user-name')
                            .text()
                            .trim(),
                    };
                })
                .get(),
    };
};
