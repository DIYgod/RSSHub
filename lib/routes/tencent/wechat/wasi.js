const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const url = `https://wx.qnmlgb.tech/authors/${id}`;

    const response = await got({
        method: 'get',
        url,
    });

    const $ = cheerio.load(response.data);
    const list = $('.ae');

    ctx.state.data = {
        title: `${$('#spider > div:nth-child(1) > div:nth-child(1)')
            .text()
            .trim()}微信公众号`,
        link: url,
        description: $('#spider > div:nth-child(2)')
            .text()
            .trim(),
        item:
            list &&
            list
                .map((i, ele) => {
                    const $ = cheerio.load(ele);
                    const link = $('a').attr('href');

                    return {
                        title: $('.pretty')
                            .text()
                            .trim(),
                        link: `https://q.qnmlgb.tech/w/api${link}`,
                        guid: `https://q.qnmlgb.tech/w/api${link}`,
                    };
                })
                .get(),
    };
};
