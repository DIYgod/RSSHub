const axios = require('../../../utils/axios');
const date = require('../../../utils/date');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const link = `https://chuansongme.com/account/${id}`;

    const response = await axios.get(link);

    const $ = cheerio.load(response.data);

    const items = await Promise.all(
        $('.feed_item')
            .slice(0, 5)
            .get()
            .map(async (e) => {
                const pubDate = date(
                    `${$(e)
                        .find('.timestamp')
                        .text()
                        .trim()}`,
                    8
                );

                const link = `https://chuansongme.com${$(e)
                    .find('.question_link')
                    .attr('href')}`;

                const response = await ctx.cache.tryGet(link, async () => (await axios.get(link)).data);

                const article = cheerio.load(response);

                article('[style="display: none;"], [style=" display: none;"], [style="display: none"]').each((i, e) => {
                    $(e).remove();
                });

                const single = {
                    title: article('#activity-name').text(),
                    link,
                    description: article('#js_content').html(),
                    pubDate,
                    author: article('#meta_content > span:nth-child(2)').text(),
                };

                return Promise.resolve(single);
            })
    );

    ctx.state.data = {
        title: `微信公众号 - ${$('.inline_editor_content')
            .first()
            .text()
            .trim()}`,
        link,
        description: $('.inline_editor_content')
            .last()
            .text()
            .trim(),
        item: items,
    };
};
