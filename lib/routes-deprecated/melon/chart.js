const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category;

    const rootUrl = 'https://www.melon.com';
    const currentUrl = `${rootUrl}/chart/${category ? category + '/' : ''}index.htm`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('tr[data-song-no]')
        .map((_, item) => {
            item = $(item);

            const image = item
                .find('.image_typeAll img')
                .attr('src')
                .split(/\/melon\//)[0];
            const title = item.find('.rank01').text();
            const name = item.find('.rank02').text();
            const album = item.find('.rank03').text();

            return {
                link: currentUrl,
                title: item.find('.rank01').text(),
                description: `<img src="${image}"><p>${title}</p><p>${name}</p><p>${album}</p>`,
            };
        })
        .get();

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
