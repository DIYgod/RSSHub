const got = require('@/utils/got');
const cheerio = require('cheerio');
const { finishArticleItem } = require('@/utils/wechat-mp');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const baseUrl = 'https://www.wxkol.com';
    const { id } = ctx.params;
    const url = `${baseUrl}/show/${id}.html`;

    const feedData = await ctx.cache.tryGet(
        url,
        async () => {
            const { data: response } = await got(url);
            const $ = cheerio.load(response);

            const list = $('.artlist li')
                .toArray()
                .map((item) => {
                    item = $(item);
                    const a = item.find('.title a');
                    return {
                        title: a.attr('title'),
                        link: a.attr('href'),
                    };
                });

            return {
                feedTitle: $('head title').text(),
                feedDescription: $('.info_left .description i').text(),
                feedImage: $('.main .logo .avatar')
                    .attr('style')
                    .match(/url\('(.+)'\)/)[1],
                feedItem: list,
            };
        },
        config.cache.routeExpire,
        false
    );

    const items = await Promise.all(feedData.feedItem.map((item) => finishArticleItem(ctx, item)));

    ctx.state.data = {
        title: feedData.feedTitle,
        description: feedData.feedDescription,
        link: url,
        image: feedData.feedImage,
        icon: feedData.feedImage,
        item: items,
    };
};
