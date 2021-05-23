const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const user = ctx.params.user;

    const response = await got({
        method: 'get',
        url: `https://soundcloud.com/${user}/tracks`,
        headers: {
            Referer: `https://soundcloud.com/${user}/tracks`,
        },
    });

    const data = response.data;

    const $ = cheerio.load(data, { xmlMode: true });
    const list = $('body article.audible').get();
    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: $('title').text(),
        link: `https://soundcloud.com/${user}/tracks`,
        description: $('meta[name="description"]').attr('content') || $('title').text(),
        item: result,
    };
};
