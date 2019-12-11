const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const name = ctx.params.name;
    const url = `https://dribbble.com/${name}`;

    const response = await got({
        method: 'get',
        url: url,
        headers: {
            Referer: url,
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('ol.dribbbles.group li.group').get();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: `Dribbble - ${name}`,
        link: url,
        description: $('meta[name="description"]').attr('content'),
        item: result,
    };
};
