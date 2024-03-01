const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.disinfo.eu';
    const currentUrl = `${rootUrl}/publications`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.elementor-heading-title a')
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

                content('.wp-block-spacer').remove();
                content('.elementor-widget-container p').eq(0).remove();

                content('img').each(function () {
                    content(this).attr('src', content(this).attr('data-lazy-src'));
                });

                item.description = content('.elementor-widget-theme-post-content').html();
                item.pubDate = parseDate(content('meta[property="article:modified_time"]').attr('content'));

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
