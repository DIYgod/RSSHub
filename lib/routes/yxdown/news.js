const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const category = ctx.params.category ? `${ctx.params.category}/` : '';

    const rootUrl = 'http://www.yxdown.com';
    const currentUrl = `${rootUrl}/news/${category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('h2 a')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
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

                    item.description = content('.news').html();
                    item.pubDate = date(content('meta[property="og:release_date"]').attr('content'));

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${$('.now').text()} - 游讯网`,
        link: currentUrl,
        item: items,
    };
};
