const axios = require('../../../utils/axios');
const cheerio = require('cheerio');
const date = require('../../../utils/date');

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const response = await axios.get(`https://wemp.app/accounts/${id}`);

    const $ = cheerio.load(response.data);
    const meta = $('.mp-info__list .mp-info__value');

    const author = $(meta[0])
        .text()
        .trim();

    const year = new Date().getFullYear();
    const items = await Promise.all(
        $('.post-item__main')
            .slice(0, 10)
            .get()
            .map(async (e) => {
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

                const link = `https://wemp.app${$(e)
                    .find('.post-item__title')
                    .attr('href')}`;

                const response = await ctx.cache.tryGet(link, async () => (await axios.get(link)).data);

                const article = cheerio.load(response);

                const single = {
                    title: $(e)
                        .find('.post-item__title')
                        .text()
                        .trim(),
                    link: article('.post__orilink')
                        .last()
                        .attr('href'),
                    description: article('#content').html(),
                    pubDate,
                    author,
                };

                return Promise.resolve(single);
            })
    );

    ctx.state.data = {
        title: `微信公众号 - ${author}`,
        link: `https://wemp.app/accounts/${id}/`,
        description: $(meta[1])
            .text()
            .trim(),
        item: items,
    };
};
