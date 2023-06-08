const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 10;

    const path = ctx.path === '/sohac' ? '/index/tzgg' : ctx.path.replace(/^\/sohac/, '');

    const rootUrl = 'https://sohac.nenu.edu.cn';
    const currentUrl = `${rootUrl}${path}.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('span.data')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item).prev();

            return {
                title: item.text(),
                link: new URL(item.attr('href'), rootUrl).href,
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

                item.title = content('.biaoti').text();
                item.description = content('.v_news_content').html();
                item.pubDate = parseDate(
                    content('.sj')
                        .text()
                        .match(/(\d{4}-\d{2}-\d{2})/)[1]
                );

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
