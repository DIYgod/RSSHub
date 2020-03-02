const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got.get('https://www.invisionapp.com/inside-design/');

    const $ = cheerio.load(response.data);

    const list = $('#recent-stories #articles-wrapper > div');
    ctx.state.data = {
        title: 'Inside Design',
        link: 'https://www.invisionapp.com/inside-design/',
        item: list
            .map((i, item) => {
                const itemDom = $(item);
                return {
                    title: itemDom.find('.text h3').text(),
                    description: `<img src="${itemDom.find('img').attr('src')}">`,
                    link: 'https://www.invisionapp.com' + itemDom.find('.hover > a').attr('href'),
                };
            })
            .get(),
    };
};
