const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://bad.news';
    const currentUrl = `${rootUrl}${ctx.path === '/' ? '' : ctx.path}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    $('.option, .pagination').remove();

    const items = $('.entry')
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a.title');

            return {
                title: a.text(),
                link: a.attr('href'),
                description: item.find('.coverdiv').html(),
                author: item.find('.author').text().trim(),
                pubDate: timezone(parseDate(item.find('time').attr('datetime')), +8),
                category: item
                    .find('.label')
                    .toArray()
                    .map((l) => $(l).text().trim()),
            };
        });

    ctx.state.data = {
        title: `Bad.news - ${$('.active').text()}${$('.selected').text()}`,
        link: currentUrl,
        item: items,
    };
};
