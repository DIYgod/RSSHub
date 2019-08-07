const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseUrl = 'https://gouhuo.qq.com';
    const url = `${baseUrl}/guide`;
    const response = await got({
        method: 'get',
        url: url,
        headers: {
            Referer: `https://gouhuo.qq.com/`,
        },
    });
    const body = response.data;
    const $ = cheerio.load(body);

    const list = $('.we-list-content')
        .first()
        .find('.we-list-item')
        .get();

    ctx.state.data = {
        title: $('title')
            .text()
            .split('_')[0],
        link: url,
        item: list.map((i) => {
            const item = $(i);
            const single = {
                title: item
                    .find('a')
                    .first()
                    .text(),
                pubDate: item.find('.we-list-time').text(),
                link:
                    baseUrl +
                    item
                        .find('a')
                        .first()
                        .attr('href'),
            };
            return single;
        }),
    };
};
