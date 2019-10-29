const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got({
        method: 'get',
        url: `https://www.zhihu.com/collection/${id}`,
        headers: {
            ...utils.header,
            Referer: `https://www.zhihu.com/collection/${id}`,
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.zm-item');

    ctx.state.data = {
        title: $('title').text(),
        link: `https://www.zhihu.com/collection/${id}`,
        description: `${$('#zh-fav-head-description').text()}`,
        item:
            list &&
            list
                .map((index, item) => {
                    const $item = $(item);
                    const $title = $item.find('.zm-item-title>a');
                    const linkUrl = $item.find('[itemprop="url"]').attr('href');

                    return {
                        title: $title.text(),
                        description: utils.ProcessImage($item.find('textarea').text()),
                        link: linkUrl,
                    };
                })
                .get(),
    };
};
