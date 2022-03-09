const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'news';

    const rootUrl = 'https://sputniknews.cn';
    const currentUrl = `${rootUrl}/services/${category}/more.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.list__title')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
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

                item.category = content('.tag__text')
                    .toArray()
                    .map((tag) => content(tag).text());

                content('.article__meta, .article__title, .article__info, .article__quote-bg, .article__footer, .m-buy, .photoview__ext-link').remove();
                content('div[data-type="article"]').remove();

                item.description = content('.article').html();
                item.pubDate = parseDate(content('div[itemprop="datePublished"]').attr('data-unixtime'));

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${category} - 俄罗斯卫星通讯社`,
        link: `${rootUrl}/${category}`,
        item: items,
    };
};
