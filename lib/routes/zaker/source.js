const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const date_util = require('../../utils/date');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const link = `http://www.myzaker.com/source/${id}`;

    const response = await axios.get(link);
    const $ = cheerio.load(response.data);
    const title = $('a.nav_item_active').text();

    const list = $('div.figure.flex-block')
        .slice(0, 10)
        .map(function() {
            const info = {
                title: $(this)
                    .find('h2 a')
                    .attr('title'),
                link: $(this)
                    .find('h2 a')
                    .attr('href'),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const itemUrl = 'http:' + info.link;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await axios({
                url: itemUrl,
                method: 'get',
                headers: {
                    Referer: link,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:62.0) Gecko/20100101 Firefox/62.0',
                },
            });
            const $ = cheerio.load(response.data);
            const description = $('div.article_content div')
                .html()
                .replace(/data-original/g, `src`);

            const date = $('span.time').text();

            const single = {
                title: title,
                link: itemUrl,
                description: description,
                pubDate: date_util(date, 8),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single), 24 * 60 * 60);
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `${title}-ZAKER新闻`,
        link: link,
        item: out,
    };
};
