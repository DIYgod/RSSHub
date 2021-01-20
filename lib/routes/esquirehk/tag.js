const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    let id = ctx.params.id || 'Fashion';

    id = id.toLowerCase();

    const rootUrl = 'https://www.esquirehk.com';
    const topics = ['style', 'watch', 'money-investment', 'lifestyle', 'culture', 'mens-talk', 'gear', 'people'];

    let currentUrl = `${rootUrl}/tag/${id}`;
    if (topics.indexOf(id) > -1) {
        currentUrl = `${rootUrl}/${id}`;
    }

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('.FeedStory')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                author: item.find('.author').text(),
                link: `${rootUrl}${item.find('a.Anchor').eq(0).attr('href')}`,
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

                    content('.RelatedBlock').remove();
                    content('.TagContainer').remove();
                    content('.YouMayLikeContainer').remove();
                    content('.SubscriptionContainer').remove();

                    content('img').each(function () {
                        const srcset = content(this).attr('srcset');
                        if (srcset) {
                            content(this).removeAttr('srcset');
                            content(this).removeAttr('data-src');
                            content(this).attr('src', `${rootUrl}${srcset.split(',')[1].replace('1032w', '')}`);
                        }
                    });

                    item.title = content('.CommonTitle').text();
                    item.description = content('.ArticlePage').html();
                    item.pubDate = new Date(content('.ArticleFeeds-info time').eq(0).attr('data-timestamp') * 1000).toUTCString();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${$('title').text()} - Esquirehk`,
        link: currentUrl,
        item: items,
    };
};
