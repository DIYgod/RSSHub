const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'https://tech.meituan.com/';
    const title = '美团技术团队';
    const response = await axios({
        method: 'get',
        url: link,
    });
    const $ = cheerio.load(response.data);
    const items = $('.post-container')
        .map((index, elem) => {
            elem = $(elem);
            const $link = elem.find('.post-title a');
            const item = {
                title: $link.text(),
                link: $link.attr('href'),
                description: elem.find('.post-content').text(),
                pubDate: elem.find('.meta-box .m-post-date').text(),
            };
            return item;
        })
        .get();
    ctx.state.data = {
        title: title,
        link: link,
        item: items,
    };
};
