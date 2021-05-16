const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.manictime.com/Releases';
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('.col-md-4')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                link: rootUrl,
                title: item.find('h2').text(),
                description: item.next().html(),
                pubDate: new Date(item.find('p').eq(0).text().replace('Release date - ', '')).toUTCString(),
            };
        })
        .get();

    ctx.state.data = {
        title: 'ManicTime releases',
        link: rootUrl,
        item: items,
    };
};
