const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const response = await got(`https://www.dongqiudi.com/special/${id}`);

    const $ = cheerio.load(response.data);

    const host = 'https://www.dongqiudi.com';

    const list = $('.detail.special ul li h3')
        .slice(0, ctx.query.limit ? Number(ctx.query.limit) : 5)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').text(),
                link: host + item.find('a').attr('href'),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);

                utils.ProcessFeedType2(item, response);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `懂球帝专题-${$('.detail.special h1').text()}`,
        description: $('.detail.special h4').text(),
        link: `https://www.dongqiudi.com/special/${id}`,
        item: out.filter((e) => e !== undefined),
    };
};
