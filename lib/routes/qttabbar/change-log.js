const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'http://qttabbar.wikidot.com/change-log';
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);

    $('p strong a').parent().parent().remove();

    const items = $('#page-content')
        .children('p')
        .map((_, item) => {
            item = $(item);
            return {
                link: rootUrl,
                title: item.text(),
                description: item.next().html(),
                pubDate: new Date(item.text().match(/\((.*)\)/)).toUTCString(),
            };
        })
        .get();

    ctx.state.data = {
        title: 'Change Log - QTTabBar',
        link: rootUrl,
        item: items,
    };
};
