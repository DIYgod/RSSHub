const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.agemys.cc';
    const currentUrl = `${rootUrl}/update`;
    const response = await got(currentUrl);

    const $ = cheerio.load(response.data);

    const list = $('.anime_icon2_name a')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
                guid: `${rootUrl}${item.attr('href')}#${item.parent().prev().find('.anime_icon1_name1').text()}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = cheerio.load(detailResponse.data);

                item.description = content('.div_left').html();

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
