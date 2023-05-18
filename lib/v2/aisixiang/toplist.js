const got = require('@/utils/got');
const cheerio = require('cheerio');
const { rootUrl, ProcessFeed } = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '1';
    const period = ctx.params.period ?? '1';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 30;

    const currentUrl = `${rootUrl}/toplist${id ? `?id=${id}${id === '1' ? `&period=${period}` : ''}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const title = `${$('.hl').text() || ''}${$('title').text().split('_')[0]}`;

    const items = $('div.tips a')
        .toArray()
        .map((item) => {
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
    };
};
