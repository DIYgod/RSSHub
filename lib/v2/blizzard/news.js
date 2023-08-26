const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || '';
    const language = ctx.params.language || 'en-us';

    const rootUrl = 'https://news.blizzard.com';
    const currentUrl = `${rootUrl}/${language}/${category}`;
    const apiUrl = `${rootUrl}/${language}/blog/list`;
    const response = await got(apiUrl, {
        searchParams: {
            community: category === '' ? 'all' : category,
        },
    });

    const $ = cheerio.load(response.data.html, null, false);

    const list = $('.FeaturedArticle-text > a, .ArticleListItem > article > a')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = cheerio.load(detailResponse.data);

                item.author = content('.ArticleDetail-bylineAuthor').text();
                item.description = content('.ArticleDetail-headingImageBlock').html() + content('.ArticleDetail-content').html();
                item.pubDate = content('.ArticleDetail-subHeadingLeft time').attr('timestamp');

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
