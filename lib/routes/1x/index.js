const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    ctx.params.type = ctx.params.type || 'latest';
    ctx.params.caty = ctx.params.caty || 'all';

    const rootUrl = `https://1x.com`;
    const currentUrl = `${rootUrl}/photos/${ctx.params.type}/${ctx.params.caty}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('#photos_target')
        .find('td a img')
        .slice(0, 30)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.attr('title'),
                link: `${rootUrl}/${item.parent().attr('href')}`,
                description: `<img src="${item.attr('src')}">`,
                author: item.attr('title'),
            };
        })
        .get();

    ctx.state.data = {
        title: `${$('title').text()} - ${ctx.params.caty}`,
        link: currentUrl,
        item: list,
    };
};
