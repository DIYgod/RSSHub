const axios = require('@/utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'http://logo.baidu.com/main/show_data/0/0/0/0',
    });

    const $ = cheerio.load(response.data);

    ctx.state.data = {
        title: '百度趣画',
        link: 'http://logo.baidu.com/',
        item: $('.col')
            .map((index, item) => {
                item = $(item);

                return {
                    title: `${item.find('.title').text()}-${item.find('.date').text()}`,
                    description: `<img referrerpolicy="no-referrer" src="${item.find('.thumb-image img').attr('src')}">`,
                    link: item.find('.more a').attr('href'),
                };
            })
            .get(),
    };
};
