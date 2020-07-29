const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = `https://www.wired.com/tag/${ctx.params.tag}/page`;

    const response = await got({
        method: 'get',
        url,
    });

    const $ = cheerio.load(response.data);
    const list = $('.archive-list-component__items li');

    const posts = list
        .map((index_, content_) => ({
            title: $(content_).find('.archive-item-component__title').text(),
            description: `<img
                src="${$(content_).find('.image-group-component img').attr('src')}">
                <br>
                ${$(content_).find('.archive-item-component__desc').text()}`,
            link: `https://www.wired.com${$(content_).find('.archive-item-component__link').attr('href')}`,
        }))
        .get();

    ctx.state.data = {
        title: `Wired - ${ctx.params.tag}`,
        link: url,
        item: posts,
    };
};
