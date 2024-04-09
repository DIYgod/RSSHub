const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'http://wap.zuel.edu.cn';
    const currentUrl = `${rootUrl}/notice/list.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.list_item')
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('.Article_Title a');

            return {
                title: a.text(),
                pubDate: parseDate(item.find('.Article_PublishDate').text()),
                link: `${/^http/.test(a.attr('href')) ? '' : rootUrl}${a.attr('href')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.description = content('.wp_articlecontent, .psgCont, .infodetail').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '中南财经大学 - 通知公告',
        link: currentUrl,
        item: items,
    };
};
