const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 35;

    const rootUrl = 'https://www.aqara.com';
    const currentUrl = `${rootUrl}/news`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    let items = response.data
        .match(/parm.contentHerf = '(\d+)'/g)
        .slice(0, limit)
        .map((item) => ({
            link: `${rootUrl}/${item.match(/'(\d+)'/)[1]}`,
        }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.title = content('h4.fnt_56').last().text();
                item.description = content('.news_body').html();
                item.pubDate = parseDate(
                    content('.news_date')
                        .first()
                        .text()
                        .replace(/( {2}年 {2}| {2}月 {2})/g, '-')
                        .replace(/ {2}日/, '')
                );

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '新闻动态 - Aqara 全屋智能',
        link: currentUrl,
        item: items,
    };
};
