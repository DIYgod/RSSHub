const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'real';

    const rootUrl = 'https://news.cts.com.tw';
    const currentUrl = `${rootUrl}/${category}/index.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('#newslist-top a[title]')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 50)
        .map((_, item) => {
            item = $(item);

            return {
                link: item.attr('href'),
                title: item.attr('title'),
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

                content('.cts-tbfs').remove();

                item.description = content('.artical-content').html();
                item.category = content('meta[name="section"]').attr('content');
                item.pubDate = parseDate(content('meta[name="pubdate"]').attr('content'));

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
