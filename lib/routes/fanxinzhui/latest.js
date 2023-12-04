const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const rootUrl = 'http://www.fanxinzhui.com';
    const currentUrl = `${rootUrl}/lastest`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.la')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const pubDate = item.find('.time');

            pubDate.remove();

            return {
                title: item.text(),
                pubDate: date(pubDate.text()),
                link: `${rootUrl}${item.attr('href')}`,
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

                item.description = content('.middle_box').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '最近更新 - 追新番',
        link: currentUrl,
        item: items,
    };
};
