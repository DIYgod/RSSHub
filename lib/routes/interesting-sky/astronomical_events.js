const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const year = ctx.params.year || new Date().getFullYear().toString();

    const rootUrl = 'https://interesting-sky.china-vo.org';
    const currentUrl = `${rootUrl}/category/year/${year}astronomical_events/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('article')
        .map((_, item) => {
            item = $(item);

            const title = item.find('.entry-title a');

            return {
                title: title.text(),
                link: title.attr('href'),
                author: item.find('.author').text(),
                description: item.find('.article_content').html(),
                pubDate: new Date(item.find('time.entry-date').attr('datetime')).toUTCString(),
            };
        })
        .get();

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
