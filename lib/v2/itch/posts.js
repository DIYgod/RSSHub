const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const topic = ctx.params.topic;
    const id = ctx.params.id;

    const rootUrl = 'https://itch.io';
    const currentUrl = `${rootUrl}/t/${topic}/${id}?before=999999999`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('.post_grid')
        .toArray()
        .map((item) => {
            item = $(item);

            const author = item.find('.post_author').text();
            const description = item.find('.post_body');

            return {
                author,
                description: description.html(),
                title: `${author}: ${description.text()}`,
                link: item.find('.post_date a').attr('href'),
                pubDate: parseDate(item.find('.post_date').attr('title')),
            };
        });

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
