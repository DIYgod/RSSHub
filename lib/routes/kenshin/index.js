const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || '';
    const type = ctx.params.type || '';

    const rootUrl = 'http://kenshin.hk';
    const currentUrl = `${rootUrl}${category && type ? `/category/${category}/${type}` : ''}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.entry-title a')
        .slice(0, 10)
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

                    content('.fb-comments').prev().remove();
                    content('.code-block, .fb-comments').remove();

                    item.description = content('.entry-content').html();
                    item.pubDate = new Date(content('meta[property="article:published_time"]').attr('content'));

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
