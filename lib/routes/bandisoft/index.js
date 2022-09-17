const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const lang = ctx.params.lang || 'en';
    const id = ctx.params.id || 'bandizip';

    const rootUrl = `https://${lang}.bandisoft.com`;
    const currentUrl = `${rootUrl}/${id}/history/`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('h2')
        .map((_, item) => {
            item = $(item);

            const title = item.text();
            item.children('font').remove();

            return {
                title,
                link: currentUrl,
                description: item.next().html(),
                pubDate: new Date(item.text()).toUTCString(),
            };
        })
        .get();

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
