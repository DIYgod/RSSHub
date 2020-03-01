const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const utils = require('./utils');

const host = 'https://p-articles.com/';

module.exports = async (ctx) => {
    const author = ctx.params.author;

    const link = `https://p-articles.com/contributors/${author}`;

    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const list = $('div.contect_box_05in > a')
        .map(function() {
            const info = {
                title: $(this)
                    .find('h3')
                    .text()
                    .trim(),
                link: url.resolve(host, $(this).attr('href')),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const link = info.link;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const response = await got.get(link);

            return utils.ProcessFeed(ctx, info, response.data);
        })
    );

    ctx.state.data = {
        title: `虛詞作者-${author}`,
        link: link,
        item: out,
    };
};
