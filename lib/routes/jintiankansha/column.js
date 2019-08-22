const got = require('../../utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got({
        method: 'get',
        url: `http://www.jintiankansha.me/column/${id}`,
    });
    const $ = cheerio.load(response.data);
    const out = $('#Main > div:nth-child(6) > div.entries')
        .children()
        .map((_, item) => {
            item = $(item);
            return {
                link: item.find('span.item_title > a').attr('href'),
                title: item.find('span.item_title > a').text(),
                description: item.find('span.item_title > a').text(),
            };
        })
        .get();
    ctx.state.data = {
        title: '今天看啥',
        link: `http://http://www.jintiankansha.me/column/${id}`,
        description: `${id}`,
        item: out,
    };
};
