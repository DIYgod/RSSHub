const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');

module.exports = async (ctx) => {
    const { order = 'best' } = ctx.params;
    const link = `https://allpoetry.com/poems/about/spotlight-oldpoem?order=${order}}`;
    const host = 'https://allpoetry.com/';

    const response = await axios({
        method: 'get',
        url: link,
    });

    const data = response.data;

    const $ = cheerio.load(data);

    const items = await Promise.all(
        $('.sub')
            .slice(0, 5)
            .get()
            .map(async (e) => {
                let itemUrl = $(e)
                    .find('h1.title > a')
                    .attr('href');

                itemUrl = url.resolve(host, itemUrl);

                const cache = await ctx.cache.get(itemUrl);
                if (cache) {
                    return Promise.resolve(JSON.parse(cache));
                }

                const single = {
                    title: $(e)
                        .find('h1.title > a')
                        .text(),
                    description: $(e)
                        .find('div.poem_body')
                        .html(),
                    link: itemUrl,
                    author: $(e)
                        .find('div.bio >a ')
                        .attr('data-name'),
                    guid: itemUrl,
                };

                ctx.cache.set(itemUrl, JSON.stringify(single), 24 * 60 * 60);
                return Promise.resolve(single);
            })
    );

    ctx.state.data = {
        title: `All Poetry - ${order.toUpperCase() + order.slice(1)}`,
        link,
        item: items,
    };
};
