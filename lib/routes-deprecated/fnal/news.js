const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category || 'allnews';

    const rootUrl = 'https://news.fnal.gov';
    const currentUrl = `${rootUrl}/newsroom/news/?se=&c=${category}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.post-title a')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
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

                item.author = content('.author').text();
                item.description = content('.entry-content, .article-content').html();
                item.pubDate = content('meta[property="article:published_time"]').length > 0 ? Date.parse(content('meta[property="article:published_time"]').attr('content')) : parseDate(content('.teaser-date').text(), 'MM/DD/YY');

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('title').text()} - Fermilab`,
        link: currentUrl,
        item: items,
    };
};
