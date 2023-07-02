const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 10;
    const rootUrl = `https://www.nasachina.cn/wp-json/wp/v2/posts?categories=2&per_page=${limit}`;
    const { data } = await got({
        method: 'get',
        url: rootUrl,
    });

    const items = await Promise.all(
        data.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);
                const description = content('main article').html();

                const single = {
                    title: item.title.rendered,
                    description,
                    pubDate: parseDate(item.date_gmt),
                    link: item.link,
                };
                return single;
            })
        )
    );

    ctx.state.data = {
        title: 'NASA中文 - 天文·每日一图',
        link: 'https://www.nasachina.cn/nasa-image-of-the-day',
        item: items,
    };
};
