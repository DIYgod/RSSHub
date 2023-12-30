const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.cia.gov';
    const currentUrl = `${rootUrl}/library/readingroom/foia-annual-report`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('.smaller-table tr')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.find('td').eq(1).text(),
                link: `${rootUrl}/${item.find('td a').eq(0).attr('href')}`,
            };
        })
        .get();

    ctx.state.data = {
        title: 'CIA Annual FOIA Reports',
        link: currentUrl,
        item: items,
    };
};
