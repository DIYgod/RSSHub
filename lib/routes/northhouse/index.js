const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || '';

    const rootUrl = 'http://www.northhouse.cc';
    const currentUrl = `${rootUrl}${category === '' ? '' : `/category/${category}`}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data.replace(/<div class="clear"><\/div>/g, '<div class="clear"></div><time>').replace(/<div class="contents">/g, '</time><div class="contents">'));

    const list = $('.entry h2 a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);

            const date = item.parent().parent().find('time').text().trim().replace(/月/, '').split(' ');

            return {
                title: item.text(),
                link: item.attr('href'),
                pubDate: new Date(`${date[0]} ${date[2]} GMT+8`).toUTCString(),
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

                    content('.crp_related').remove();

                    item.description = content('.contents').html();

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
