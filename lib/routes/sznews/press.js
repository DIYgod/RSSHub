const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const rootUrl = 'http://www.sznews.com';
    const currentUrl = `${rootUrl}/zhuanti/node_210611.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.list-pt-li a h3')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item).parent();

            return {
                title: item.text(),
                link: item.attr('href'),
                pubDate: timezone(new Date(item.parent().find('.date').text()), +8),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                item.description = content('#picBox').html() + content('.pos').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '往期回顾 - 深圳市政府新闻发布厅',
        link: currentUrl,
        item: items,
    };
};
