const got = require('@/utils/got');
const cheerio = require('cheerio');
const { getItem } = require('./util');

module.exports = async (ctx) => {
    let tag = ctx.params.tag;
    tag = tag === undefined || tag === 'undefined' ? '' : tag;

    const link = `https://www.mzitu.com/tag/${tag}`;
    const response = await got({
        method: 'get',
        url: link,
    });
    const $ = cheerio.load(response.data);
    const items = await getItem(ctx, response.data);

    let name = $('div.currentpath').text();
    name = name.split('»')[1];

    ctx.state.data = {
        title: name,
        link: link,
        item: items,
    };
};
