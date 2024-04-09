const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'https://99percentinvisible.org/';

module.exports = async (ctx) => {
    const link = url.resolve(host, 'archives/');
    const response = await got.get(link);

    const $ = cheerio.load(response.data);

    const list = $('.content .post-blocks a.post-image')
        .map((i, e) => $(e).attr('href'))
        .get();

    const out = await Promise.all(
        list
            .filter((e) => e.startsWith(url.resolve(host, 'episode/')))
            .map(async (itemUrl) => {
                const cache = await ctx.cache.get(itemUrl);
                if (cache) {
                    return Promise.resolve(JSON.parse(cache));
                }

                const response = await got.get(itemUrl);
                const $ = cheerio.load(response.data);

                const single = {
                    title: $('article header h1').text().trim(),
                    link: itemUrl,
                    author: '99% Invisible',
                    description: $('article .page-content').html(),
                    pubDate: new Date($('article header .entry-meta time').text()).toUTCString(),
                };
                ctx.cache.set(itemUrl, JSON.stringify(single));
                return Promise.resolve(single);
            })
    );

    ctx.state.data = {
        title: '99% Invisible Transcript',
        link,
        item: out,
    };
};
