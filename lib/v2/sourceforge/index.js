const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const routeParams = ctx.params.routeParams;

    const baseURL = 'https://sourceforge.net';
    const link = `https://sourceforge.net/directory/?${routeParams.toString()}`;

    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const itemList = $('ul.projects li[itemprop=itemListElement]');

    ctx.state.data = {
        title: $('.content h1').text().trim(),
        link,
        item: itemList.toArray().map((element) => {
            const item = $(element);
            const title = item.find('.result-heading-title').text().trim();
            const link = `${baseURL}${item.find('.result-heading-title').attr('href')}`;
            const description = item.find('.result-heading-texts').html();
            const pubDate = parseDate(item.find('time').attr('datetime'), 'YYYY-MM-DD');

            return {
                title,
                link,
                description,
                pubDate,
            };
        }),
    };
};
