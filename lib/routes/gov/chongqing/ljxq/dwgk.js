const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'http://ljxq.cq.gov.cn/dwgk/';

    const response = await got({
        method: 'get',
        url: rootUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('div.gl-c-r-content ul li')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');

            return {
                title: a.text(),
                link: url.resolve(rootUrl, a.attr('href')),
                pubDate: new Date(item.find('span').text() + ' GMT+8').toUTCString(),
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

                    item.description = content('div.zwxl-article').html();
                    return item;
                })
        )
    );

    ctx.state.data = {
        title: '两江新区信息公开网 - 党务公开',
        link: rootUrl,
        item: items,
    };
};
