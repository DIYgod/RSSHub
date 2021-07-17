const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const category = ctx.params.category || '';

    const rootUrl = 'http://www.yxdown.com';
    const currentUrl = `${rootUrl}/news${category === '' ? '' : `/${category}/`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.new_zixun h2 a')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')} `,
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

                    item.pubDate = timezone(new Date(content('.intro span').eq(0).text()), +8);

                    content('h1, .intro').remove();

                    item.description = content('.news').html();

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
