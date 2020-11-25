const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx, currentUrl) => {
    const rootUrl = 'https://www.sobooks.cc';
    currentUrl = `${rootUrl}/${currentUrl}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.card-item h3 a')
        .slice(0, 15)
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

                    content('.e-secret, .article-social').remove();

                    item.description = content('.article-content').html();
                    item.pubDate = new Date(content('.bookinfo ul li').eq(4).text().replace('时间：', '')).toUTCString();

                    return item;
                })
        )
    );

    return {
        title: ($('.archive-header h1').text() ? $('.archive-header h1').text() + ' - ' : '') + 'SoBooks',
        link: currentUrl,
        item: items,
    };
};
