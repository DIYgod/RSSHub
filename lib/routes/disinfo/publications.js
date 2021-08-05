const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

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
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    item.description = content('.elementor-widget-theme-post-content').html();
                    item.pubDate = date(content('meta[property="article:modified_time"]').attr('content'));

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
