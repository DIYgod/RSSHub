const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.cnbeta.com/',
        headers: {
            Referer: 'https://www.cnbeta.com/',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.items-area [id^="J_all_item_"]').get();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: 'cnBeta',
        link: 'https://www.cnbeta.com/',
        description: $('meta[name="description"]').attr('content'),
        item: result,
    };
};
