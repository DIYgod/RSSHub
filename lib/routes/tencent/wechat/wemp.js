const axios = require('../../../utils/axios');
const cheerio = require('cheerio');
const date = require('../../../utils/date');

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
        .map((e) => {
            let pubDate = date(
                `${year} ${$(e)
                    .find('.post-item__date')
                    .text()
                    .trim()}`,
                8
            );

            if (new Date(pubDate) > new Date()) {
                pubDate = new Date(pubDate).setFullYear(year - 1);
                pubDate = new Date(pubDate).toUTCString();
            }

            return {
                title: $(e)
                    .find('.post-item__title')
                    .text()
                    .trim(),
                link: `https://wemp.app${$(e)
                    .find('.post-item__title')
                    .attr('href')}`,
                pubDate,
                author,
            };
        });

    ctx.state.data = {
        title: `微信公众号 - ${author}`,
        link: `https://wemp.app/accounts/${id}/`,
        description: $('.mp-info__value')
            .text()
            .trim(),
        item: items,
    };
};
