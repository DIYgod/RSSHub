const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://blogread.cn/news/newest.php';
    const response = await axios({
        method: 'get',
        url,
    });
    const $ = cheerio.load(response.data);
    const resultItem = $('.media')
        .map((index, elem) => {
            elem = $(elem);
            const $link = elem.find('dt a');
            const pubDate = elem
                .find('.small')
                .text()
                .match(/\s[0-9-]+\s[0-9:]+\s/g)[0]
                .trim();

            return {
                title: $link.text(),
                description: elem
                    .find('dd')
                    .eq(0)
                    .text(),
                link: $link.attr('href'),
                pubDate: new Date(pubDate).toUTCString(),
                author: elem
                    .find('.small a')
                    .eq(0)
                    .text(),
            };
        })
        .get();

    ctx.state.data = {
        title: '技术头条',
        link: url,
        item: resultItem,
    };
};
