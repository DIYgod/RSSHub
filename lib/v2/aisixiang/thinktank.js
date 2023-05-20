const got = require('@/utils/got');
const cheerio = require('cheerio');
const { rootUrl, ProcessFeed } = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const type = ctx.params.type ?? '';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 30;

    const currentUrl = `${rootUrl}/thinktank/${id}.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const title = `${$('h2').first().text().trim()}${type}`;

    let items = [];

    const targetList = $('h3')
        .toArray()
        .filter((h) => (type ? $(h).text() === type : true));
    if (!targetList) {
        throw `Not found ${type} in ${id}: ${currentUrl}`;
    }

    for (const l of targetList) {
        items = [...items, ...$(l).parent().find('ul li a').toArray()];
    }

    items = items.map((item) => {
        item = $(item);

        return {
            title: item.text().split('：').pop(),
            link: new URL(item.attr('href'), rootUrl).href,
        };
    });

    ctx.state.data = {
        title: `爱思想 - ${title}`,
        link: currentUrl,
        item: await ProcessFeed(limit, ctx.cache.tryGet, items),
        description: $('div.thinktank-author-description-box p').text(),
    };
};
