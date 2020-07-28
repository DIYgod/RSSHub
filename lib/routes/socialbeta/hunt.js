const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const currentUrl = `http://hunt.socialbeta.com/`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('div.ml64')
        .slice(0, 50)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: a.attr('href'),
                description: item.find('div.content').text(),
            };
        })
        .get();

    ctx.state.data = {
        title: 'SocialBeta - 案例',
        link: currentUrl,
        item: list,
    };
};
