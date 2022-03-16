const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const language = ctx.params.language ?? 'en';

    const rootUrl = 'https://nodejs.org';
    const currentUrl = `${rootUrl}/${language}/blog`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    $('.summary').remove();

    let items = $('ul.blog-index li a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.pubDate = parseDate(content('time').attr('datetime'));
                item.author = content('.blogpost-meta')
                    .text()
                    .match(/by (.*), /)[1];

                content('.blogpost-header').remove();

                item.description = content('article').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'News - Node.js',
        link: currentUrl,
        item: items,
    };
};
