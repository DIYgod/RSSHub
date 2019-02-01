const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');

const host = 'https://99percentinvisible.org/';

module.exports = async (ctx) => {
    const link = url.resolve(host, 'archives/');
    const response = await axios.get(link);

    const $ = cheerio.load(response.data);

    const list = $('.content .post-blocks .post-actions a.transcript')
        .map((i, e) => $(e).attr('href'))
        .get();

    const out = await Promise.all(
        list
            .filter((e) => e.startsWith('/episode'))
            .map(async (itemUrl) => {
                itemUrl = url.resolve(host, itemUrl);
                const cache = await ctx.cache.get(itemUrl);
                if (cache) {
                    return Promise.resolve(JSON.parse(cache));
                }

                const response = await axios.get(itemUrl);
                const $ = cheerio.load(response.data);

                const single = {
                    title: $('article header h1')
                        .text()
                        .trim(),
                    link: itemUrl,
                    author: '99% Invisible',
                    description: $('article .transcript-content').html(),
                    pubDate: new Date($('article header .entry-meta time').text()),
                };
                ctx.cache.set(itemUrl, JSON.stringify(single), 24 * 60 * 60);
                return Promise.resolve(single);
            })
    );

    ctx.state.data = {
        title: '99% Invisible Transcript',
        link,
        item: out,
    };
};
