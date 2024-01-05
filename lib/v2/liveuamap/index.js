const got = require('@/utils/got');
const cheerio = require('cheerio');
const { isValidHost } = require('@/utils/valid-host');

module.exports = async (ctx) => {
    let region = ctx.params.region ?? 'ukraine';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 50;
    if (!isValidHost(region)) {
        throw Error('Invalid region');
    }

    let url = `https://${region}.liveuamap.com/`;
    if (region === undefined) {
        region = 'Default';
        url = 'https://liveuamap.com/';
    }

    const response = await got({
        method: 'get',
        url,
    });
    const $ = cheerio.load(response.data);

    const items = $('div#feedler > div')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('div.title').text(),
                description: item.find('div.title').text(),
                link: item.attr('data-link'),
            };
        });

    ctx.state.data = {
        title: `Liveuamap - ${region}`,
        link: url,
        item: items,
    };
};
