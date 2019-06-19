const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://v8.dev';

module.exports = async (ctx) => {
    const response = await got(host + '/features');
    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('ol li')
        .slice(0, 10)
        .map((index, item) => ({
            title:
                $(item)
                    .find('a:first-child > code')
                    .text()
                    .trim() ||
                $(item)
                    .find('a:first-child')
                    .text()
                    .trim(),
            link:
                host +
                $(item)
                    .find('a:first-child')
                    .attr('href'),
            pubDate: new Date(
                $(item)
                    .find('time')
                    .text()
                    .trim()
            ).toUTCString(),
        }))
        .get();

    const item = await Promise.all(
        list.map(async (info) => {
            const itemUrl = info.link;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);
            const description = $(`div[itemprop='articleBody']`)
                .html()
                .trim();

            const item = {
                title: info.title,
                link: itemUrl,
                description,
                pubDate: info.pubDate,
            };

            ctx.cache.set(itemUrl, JSON.stringify(item));
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: $('head > title').text(),
        link: host + '/features',
        description: 'V8 JS/Wasm features',
        item,
    };
};
