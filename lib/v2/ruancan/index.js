const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const todo = ctx.params.do ?? '';
    const keyword = ctx.params.keyword ?? '';

    const rootUrl = 'https://www.ruancan.com';
    const currentUrl = `${rootUrl}${todo ? (todo === 'search' ? `/page/1?s=${keyword}` : `/${todo}/${keyword}`) : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.entry-title a')
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

                content('.entry-content .heateorSssClear').first().nextAll().remove();
                content('.adsbygoogle, .heateorSssClear').remove();

                item.description = content('.entry-content').html();
                item.category = content('.cat-links a')
                    .toArray()
                    .map((a) => content(a).text());
                item.pubDate = parseDate(content('meta[property="article:published_time"]').attr('content'));

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
