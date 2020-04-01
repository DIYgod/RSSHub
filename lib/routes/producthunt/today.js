const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got.get('https://www.producthunt.com/');

    const $ = cheerio.load(response.data);

    const list = $('ul[class^="postsList"] li');
    ctx.state.data = {
        title: 'Product Hunt Today Popular',
        link: 'https://www.producthunt.com/',
        item: list
            .map((i, item) => {
                const itemDom = $(item);
                return {
                    title: itemDom.find('h3').text(),
                    description: `${itemDom.find('h3 + p').text()}<br><img src="${itemDom.find('h3').attr('src')}">`,
                    link: 'https://www.producthunt.com' + itemDom.find('a').attr('href'),
                };
            })
            .get(),
    };
};
