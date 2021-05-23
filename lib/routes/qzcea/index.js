const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    ctx.params.caty = ctx.params.caty || '1';

    const rootUrl = 'http://www.qzcea.org';
    const currentUrl = `${rootUrl}/usernewscatname_nc${ctx.params.caty}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    $('a.news-more').remove();

    const list = $('li.clearfix div.news-right a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
                pubDate: new Date(item.next().text().replace('时间 ：', '') + ' GMT+8').toUTCString(),
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

                    item.description = content('div.newm').html();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${$('title').text()} - 泉州市跨境电子商务协会`,
        link: currentUrl,
        item: items,
    };
};
