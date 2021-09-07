const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'http://bankofculture.com';
    const currentUrl = `${rootUrl}/文化金庫`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.tg-grid-holder .tg-item-title a')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 20)
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                content('#wp_rp_first').remove();
                content('.x-btn, .x-entry-share, .x-share-options').remove();

                item.description = `<img src="${content('.entry-thumb img').attr('src').split(' 1174w,')[0]}">` + content('.entry-content').html();
                item.pubDate = parseDate(content('meta[property="article:published_time"]').attr('content'));
                item.category = content('meta[property="article:tag"]')
                    .toArray()
                    .map((tag) => content(tag).attr('content'));

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
