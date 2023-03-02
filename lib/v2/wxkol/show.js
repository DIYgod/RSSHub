const got = require('@/utils/got');
const cheerio = require('cheerio');
const { fetchArticle } = require('@/utils/wechat-mp');
const config = require('@/config').value;
const asyncPool = require('tiny-async-pool');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.wxkol.com';
    const { id } = ctx.params;
    const url = `${baseUrl}/show/${id}.html`;

    const asyncPoolAll = async (...args) => {
        const results = [];
        for await (const result of asyncPool(...args)) {
            results.push(result);
        }
        return results;
    };

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
                        link: `${baseUrl}${a.attr('href')}`,
                    };
                });

            return {
                feedTitle: $('head title').text(),
                feedDescription: $('head description').text(),
                feedImage: $('.main .logo .avatar')
                    .attr('style')
                    .match(/url\('(.+)'\)/)[1],
                feedItem: list,
            };
        },
        config.cache.routeExpire,
        false
    );

    const urlList = await asyncPoolAll(2, feedData.feedItem, (item) =>
        ctx.cache.tryGet(item.link, async () => {
            const { data: response } = await got(item.link);
            const $ = cheerio.load(response);
            item.link = `${baseUrl}${$('.source a').attr('href')}`;
            return item;
        })
    );

    const items = await asyncPoolAll(4, urlList, async (item) => {
        const { title, author, description, summary, pubDate, mpName, link: itemLink } = await fetchArticle(ctx, item.link, true);

        item.title = title;
        item.author = author;
        item.description = description;
        item.summary = summary;
        item.pubDate = pubDate;
        item.author = mpName;
        item.link = itemLink;

        return item;
    });

    ctx.state.data = {
        title: feedData.feedTitle,
        description: feedData.feedDescription,
        link: url,
        image: feedData.feedImage,
        item: items,
    };
};
