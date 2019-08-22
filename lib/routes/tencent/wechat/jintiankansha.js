const got = require('../../../utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got({
        method: 'get',
        url: `http://www.jintiankansha.me/column/${id}`,
    });
    const $ = cheerio.load(response.data);

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);
        return $('.rich_media_content').html();
    };

    const items = await Promise.all(
        $('#Main > div:nth-child(6) > div.entries')
            .children()
            .slice(0, 5)
            .get()
            .map(async (item) => {
                const link = $(item)
                    .find('span.item_title > a')
                    .attr('href');
                const cache = await ctx.cache.get(link);
                if (cache) {
                    return Promise.resolve(JSON.parse(cache));
                }
                const response = await got({
                    method: 'get',
                    url: link,
                });
                const description = ProcessFeed(response.data);
                const single = {
                    title: $(item)
                        .find('span.item_title > a')
                        .text(),
                    description,
                    link: link,
                };
                ctx.cache.set(link, JSON.stringify(single));
                return Promise.resolve(single);
            })
    );
    ctx.state.data = {
        title: `今天看啥 - ${id}`,
        link: `http://http://www.jintiankansha.me/column/${id}`,
        description: `今天看啥 - ${id}`,
        item: items,
    };
};
