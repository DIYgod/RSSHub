const got = require('@/utils/got');
const cheerio = require('cheerio');

const { rootUrl, ossUrl, ProcessFeed } = require('./utils');

module.exports = async (ctx) => {
    const { id, type = '' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30;

    const currentUrl = new URL(`thinktank/${id}.html`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

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

    items = items.slice(0, limit).map((item) => {
        item = $(item);

        return {
            title: item.text().split('：').pop(),
            link: new URL(item.prop('href'), rootUrl).href,
        };
    });

    ctx.state.data = {
        item: await ProcessFeed(limit, ctx.cache.tryGet, items),
        title: `爱思想 - ${title}`,
        link: currentUrl,
        description: $('div.thinktank-author-description-box p').text(),
        language: 'zh-cn',
        image: new URL('images/logo_thinktank.jpg', ossUrl).href,
        subtitle: title,
    };
};
