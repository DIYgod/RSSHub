const utils = require('./utils');
const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got(utils.siteLink, {
        headers: {
            'user-agent': utils.trueUA,
        },
    });
    const $ = cheerio.load(response.data);

    const articlesLink = $('.post-info-box .post-thumb a')
        .toArray()
        .map((item) => ({ link: $(item).attr('href') }));

    const articles = await Promise.all(
        articlesLink.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { title, author, pubDate, description, category } = await utils.getArticleDetail(item.link);

                item.title = title;
                item.author = author;
                item.pubDate = pubDate;
                item.description = description;
                item.category = category;
                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        link: utils.siteLink,
        item: articles,
    };
};
