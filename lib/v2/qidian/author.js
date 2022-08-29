const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');
module.exports = async (ctx) => {
    const id = ctx.params.id;
    const rootUrl = 'https://my.qidian.com';
    const currentUrl = `${rootUrl}/author/${id}/`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);
    const author = $('.header-msg h1').contents().first().text().trim();
    const items = $('.author-work .author-item .author-item-msg')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.author-item-title').text().trim(),
                author,
                category: item.find('.author-item-exp a').first().text().trim(),
                description: item.find('.author-item-update a').attr('title'),
                pubDate: date(item.find('.author-item-update span').text().trim(), 8),
                link: item.find('.author-item-update a').attr('href'),
            };
        });

    ctx.state.data = {
        title: `${author} - 起点中文网`,
        description: $('.header-msg-desc').text().trim(),
        link: currentUrl,
        item: items,
    };
};
