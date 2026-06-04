const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.mathunion.org';
    const currentUrl = `${rootUrl}/imu-awards/fields-medal`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('div.main-section')
        .eq(2)
        .find('.list__group')
        .map((_, item) => {
            item = $(item);
            const year = item.find('h3').text();
            const detailUrl = item.find('ul li a').attr('href');

            item.find('h3, ul').remove();

            return {
                title: year,
                link: detailUrl || currentUrl,
                description: `<ul>${item.html()}</ul>`,
                pubDate: new Date(`${year}-12-31`).toUTCString(),
            };
        })
        .get();

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
