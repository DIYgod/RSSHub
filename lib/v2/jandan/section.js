const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'top';

    const rootUrl = 'http://i.jandan.net';
    const currentUrl = `${rootUrl}/${category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('ol.commentlist li')
        .not('.row')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 50)
        .toArray()
        .map((item) => {
            item = $(item);

            item.find('.commenttext img, .tucao-report').remove();

            item.find('.commenttext .view_img_link').each(function () {
                $(this).replaceWith(`<img src="${$(this).attr('href')}">`);
            });

            const author = item.find('b').first().text();
            const description = item.find('.commenttext');

            return {
                author,
                description: description.html(),
                title: `${author}: ${description.text()}`,
                pubDate: parseDate(item.find('.time').text()),
                link: `${rootUrl}/t/${item.attr('id').split('-').pop()}`,
            };
        });

    ctx.state.data = {
        title: `${$('title').text()} - 煎蛋`,
        link: currentUrl,
        item: items,
    };
};
