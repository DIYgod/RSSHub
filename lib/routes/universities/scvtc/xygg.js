const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const currentUrl = 'http://scvtc.edu.cn/ggfw1/xygg.htm';
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('div.list_l div ul li')
        .map((_, item) => {
            item = $(item);
            const a = item.find('a[title]');
            return {
                title: a.text(),
                link: url.resolve(currentUrl, a.attr('href')),
                pubDate: new Date(item.find('span.c43271_date').text().split('&nbsp;')[0].trim()).toUTCString(),
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

                    item.description = content('#vsb_content').html();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: '四川职业技术学院 - 学院公告',
        link: currentUrl,
        item: items,
    };
};
