const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const channel = ctx.params.channel || '';
    const sort = ctx.params.sort || '';

    const rootUrl = 'http://www.fanxinzhui.com';
    const currentUrl = `${rootUrl}/list?channel=${channel}&sort=${sort}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.link')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
                pubDate: date(item.parent().nextAll('.remark').eq(1).text().replace('更新时间:', '')),
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

                    item.description = content('.middle_box').html();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `影视列表 - 追新番`,
        link: currentUrl,
        item: items,
    };
};
