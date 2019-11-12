const cheerio = require('cheerio');
const got = require('@/utils/got');
const url = require('url');

const host = 'https://www.nature.com';
const link = 'https://www.nature.com/natmachintell/research';

module.exports = async (ctx) => {
    const responses = await got.get(link);
    const $ = cheerio.load(responses.data);

    const list = $('article').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('h3 a').text();
            const itemUrl = url.resolve(host, $('h3 a').attr('href'));

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const responses = await got.get(itemUrl);
            const $d = cheerio.load(responses.data);
            const description = $d('div.c-article-body').html();

            const single = {
                title,
                link: itemUrl,
                description,
            };

            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: 'nature > nature machine intelligence > latest research',
        link: link,
        item: out,
    };
};
