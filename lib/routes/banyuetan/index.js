const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const name = ctx.params.name;

    const link = `http://www.banyuetan.org/byt/${name}/index.html`;
    const response = await axios.get(link);

    const $ = cheerio.load(response.data);

    const list = $('ul.clearFix li')
        .slice(0, 10)
        .map(function() {
            const info = {
                title: $(this)
                    .find('h3 a')
                    .text(),
                link: $(this)
                    .find('h3 a')
                    .attr('href'),
                date: $(this)
                    .find('span.tag3')
                    .text(),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const date = info.date;
            const itemUrl = info.link;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await axios.get(itemUrl);

            const $ = cheerio.load(response.data);
            const description = $('div.detail_content')
                .html()
                .trim();

            const single = {
                title: title,
                link: itemUrl,
                description: description,
                pubDate: new Date(date).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single), 24 * 60 * 60);
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `${name}-半月谈`,
        link: link,
        item: out,
    };
};
