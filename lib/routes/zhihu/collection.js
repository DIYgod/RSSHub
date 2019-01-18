const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await axios({
        method: 'get',
        url: `https://www.zhihu.com/collection/${id}`,
        headers: {
            ...utils.header,
            Referer: `https://www.zhihu.com/collection/${id}`,
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('div.zm-item');

    ctx.state.data = {
        title: $('title').text(),
        link: `https://www.zhihu.com/collection/${id}`,
        description: `${$('#zh-fav-head-description').text()}`,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    let linkUrl = item
                        .find('a.meta-item')
                        .not('a.toggle-comment')
                        .attr('href');
                    if (linkUrl.startsWith('/')) {
                        linkUrl = 'https://www.zhihu.com' + linkUrl;
                    }
                    return {
                        title: item.find('.zm-item-title a').text(),
                        description: utils.ProcessImage(item.find('textarea').text()),
                        link: linkUrl,
                    };
                })
                .get(),
    };
};
