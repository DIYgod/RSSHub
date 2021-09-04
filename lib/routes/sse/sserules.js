const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const slug = ctx.params.slug || 'latest';

    const rootUrl = 'http://www.sse.com.cn';
    const currentUrl = `${rootUrl}/lawandrules/sserules/${slug.replace(/-/g, '/')}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.sse_list_1 dl dd a')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
                pubDate: new Date(item.prev().text()).toUTCString(),
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

                    item.description = content('.allZoom').html();

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
