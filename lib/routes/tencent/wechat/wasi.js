const axios = require('@/utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await axios({
        method: 'get',
        url: `https://wx.qnmlgb.tech/authors/${id}`,
    });

    const $ = cheerio.load(response.data);
    const list = $('.ae');

    ctx.state.data = {
        title: `${$('#spider > div:nth-child(1) > div:nth-child(1)')
            .text()
            .trim()}微信公众号`,
        link: `https://w.qnmlgb.tech/authors/${id}/`,
        description: $('#spider > div:nth-child(2)')
            .text()
            .trim(),
        item:
            list &&
            list
                .map((i, ele) => {
                    const $ = cheerio.load(ele);
                    return {
                        title: $('.pretty')
                            .text()
                            .trim(),
                        link: $('a').attr('href'),
                    };
                })
                .get(),
    };
};
