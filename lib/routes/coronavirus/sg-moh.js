const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const dataUrl = 'https://www.moh.gov.sg/covid-19/past-updates';
    const response = await got({
        method: 'get',
        url: dataUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('section.body-content div.sfContentBlock:nth-of-type(2) table tr').slice(1, 21);

    const items = list
        .filter((_, item) => {
            item = $(item);
            const dateRaw = item.find('td:first-child').text().trim();
            return dateRaw !== 'Date';
        })
        .map((_, item) => {
            item = $(item);
            const title = `${item.find('a').first().text()}`;
            const dateRaw = item.find('td:first-child').text().trim();
            const pubDate = Date.parse(dateRaw) && dateRaw;
            const link = item.find('a').attr('href');
            return {
                title,
                pubDate,
                link,
            };
        })
        .get();

    ctx.state.data = {
        title: 'Past Updates On COVID-19 Local Situation',
        link: dataUrl,
        description: 'Past Updates On COVID-19 Local Situation',
        item: items,
    };
};
