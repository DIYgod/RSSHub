const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'jdxw';

    const rootUrl = 'http://www.qm120.com';
    const currentUrl = `${rootUrl}/news/${category}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.lb2boxls ul li a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
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

                item.description = content('.neirong_body').html();
                item.pubDate = timezone(parseDate(content('.neirong_head p span').eq(1).text()), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('.zt_liebiao_tit').text()} - 全民健康网`,
        link: currentUrl,
        item: items,
    };
};
