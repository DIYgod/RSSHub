const axios = require('../../../utils/axios');
const cheerio = require('cheerio');
// const timezone = require('../../utils/timezone');

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const response = await axios.get(`https://wemp.app/accounts/${id}`);

    const $ = cheerio.load(response.data);
    const author = $('.mp-info__title')
        .text()
        .trim();

    const year = new Date().getFullYear();
    const items = $('.post-item__main')
        .slice(0, 10)
        .get()
        .map((e) => ({
            title: $(e)
                .find('.post-item__title')
                .text()
                .trim(),
            link: `https://wemp.app${$(e)
                .find('.post-item__title')
                .attr('href')}`,
            pubDate: timezone(
                `${year} ${$(e)
                    .find('.post-item__date')
                    .text()
                    .trim()}`,
                8
            ),
            author,
        }));

    // to be replaced
    function timezone(html, timezone) {
        return new Date(new Date(html).getTime() - 60 * 60 * 1000 * (timezone + new Date().getTimezoneOffset() / 60)).toUTCString();
    }

    ctx.state.data = {
        title: `微信公众号 - ${author}`,
        link: `https://wemp.app/accounts/${id}/`,
        description: $('.mp-info__value')
            .text()
            .trim(),
        item: items,
    };
};
