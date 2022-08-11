const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.reuters.com';
    const currentUrl = `${rootUrl}/investigates`;
    const response = await got(currentUrl);

    const $ = cheerio.load(response.data);

    const list = $('article.section-article-container.row')
        .map((_, item) => ({
            title: $(item).find('h2.subtitle').text(),
            link: $(item).find('a.row.d-flex').prop('href'),
        }))
        .get();
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = cheerio.load(detailResponse.data);

                item.title = content('title').text();
                item.description = content('#paragraph-0').text();
                item.pubDate = parseDate(content('time[itemprop="datePublished"]').attr('datetime'));
                item.author = content('meta[property="og:article:publisher"]').attr('content');

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('h1.series-subtitle').text(),
        link: currentUrl,
        item: items,
    };
};
