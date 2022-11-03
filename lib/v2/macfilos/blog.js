const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.macfilos.com';
    const currentUrl = `${rootUrl}/blog`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.entry-title a')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 10)
        .toArray()
        .map((item) => {
            item = $(item);

            const parent = item.parent().parent();

            return {
                title: item.text(),
                link: item.attr('href'),
                author: parent.find('.td-post-author-name a').text(),
                pubDate: parseDate(parent.find('.td-post-date time').attr('datetime')),
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

                content('hr').nextAll().remove();
                content('hr').remove();

                content('img').each(function () {
                    content(this).removeAttr('srcset');
                });

                item.description = content('.td-post-content').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
