const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const currentUrl = `https://www.hudongba.com/${ctx.params.city}/${ctx.params.id}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('ul.find_main_ul li.find_main_li div.find_main_div')
        .slice(0, 30)
        .map((_, item) => {
            item = $(item);
            const a = item.find('h3.find_main_title a');
            return {
                title: a.text().trim(),
                link: a.attr('href'),
                description: item.find('div.find_main_fixH').text(),
            };
        })
        .get();

    ctx.state.data = {
        title: $('div.crumbs-find').text(),
        link: currentUrl,
        item: list,
    };
};
