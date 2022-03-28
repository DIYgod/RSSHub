const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '';
    const what = ctx.params.what ?? '';

    const rootUrl = 'https://whoscall.com';
    const currentUrl = `${rootUrl}/zh-hant/blog/${id ? `${what}/${id}` : 'articles'}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.post-card__title a')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
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

                item.description = content('.blog-article__body').html();
                item.pubDate = parseDate(detailResponse.data.match(/"datePublished":"(.*)","dateModified"/)[1]);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title')
            .text()
            .replace(/ - 第\d+頁/, ''),
        link: currentUrl,
        item: items,
    };
};
