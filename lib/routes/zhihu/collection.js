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
    const list = $('.CollectionDetailPageItem');

    ctx.state.data = {
        title: $('title').text(),
        link: `https://www.zhihu.com/collection/${id}`,
        description: $('.CollectionDetailPageHeader-description').text(),
        item:
            list &&
            list
                .map((index, item) => {
                    const $item = $(item);
                    const $title = $item.find('.ContentItem-title a');
                    const linkUrl = new URL($title.attr('href'), 'https://www.zhihu.com/');
                    const image = $item.find('meta[itemprop="image"]').attr('content');
                    const text = $item.find('.CopyrightRichText-richText').text();
                    const content = image ? text + `<img src="${image}">` : text;

                    return {
                        title: $title.text(),
                        description: content,
                        link: linkUrl,
                    };
                })
                .get(),
    };
};
