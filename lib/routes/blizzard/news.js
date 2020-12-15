const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || '';
    const language = ctx.params.language || 'en-us';

    const rootUrl = `https://${language === 'zh-cn' ? 'cn.' : ''}news.blizzard.com`;
    const currentUrl = `${rootUrl}/${language}/${category}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.FeaturedArticle-text a, .ArticleListItem article a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    item.author = content('.ArticleDetail-bylineAuthor').text();
                    item.description = content('.ArticleDetail-content').html();
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
