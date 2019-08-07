const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');
const url = require('url');

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
    const host = 'https://www.zhihu.com';

    ctx.state.data = {
        title: $('title').text(),
        link: `https://www.zhihu.com/collection/${id}`,
        description: `${$('#zh-fav-head-description').text()}`,
        item:
            list &&
            list
                .map((index, item) => {
                    const $item = $(item);
                    const type = $item.data('type');
                    const $a = $item.find('.zm-item-title>a');
                    let linkUrl;
                    if (type === 'Answer') {
                        linkUrl = url.resolve(
                            host,
                            $item
                                .find('a.meta-item')
                                .not('a.toggle-comment')
                                .attr('href')
                        );
                    } else {
                        linkUrl = url.resolve(host, $a.attr('href'));
                    }

                    return {
                        title: $a.text(),
                        description: utils.ProcessImage($item.find('textarea').text()),
                        link: linkUrl,
                    };
                })
                .get(),
    };
};
