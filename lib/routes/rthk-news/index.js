const got = require('@/utils/got');
const parser = require('@/utils/rss-parser');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    let category = ctx.params.category.toLowerCase();
    const language = ctx.params.lang.toLowerCase();
    let languageUrlKey;
    switch (language) {
        case 'hk':
            languageUrlKey = 'c';
            break;
        case 'en':
            languageUrlKey = 'e';
            break;
        default:
            languageUrlKey = 'c';
            break;
    }
    if (languageUrlKey !== 'c' || category !== 'greaterchina') {
        category = languageUrlKey + category;
    }
    const rssUrl = `https://rthk.hk/rthk/news/rss/${languageUrlKey}_expressnews_${category}.xml`;
    const feed = await parser.parseURL(rssUrl);
    const title = feed.title;
    const link = feed.link;
    const description = feed.description;

    const items = await Promise.all(
        feed.items.map(async (item) => {
            const description = await ctx.cache.tryGet(item.guid, async () => {
                const response = await got({
                    method: 'get',
                    url: item.guid,
                });
                const $ = cheerio.load(response.data);

                const $descriptionRoot = cheerio.load('<div><div class="img-root"></div><div class="content-root"></div></div>');
                $descriptionRoot('div.img-root').append($('div.itemImageContainer img.imgPhotoAfterLoad'));
                $descriptionRoot('div.content-root').append(item.content.replace(/\r\n/g, '<br/>'));

                return $descriptionRoot.html();
            });
            const single = {
                title: item.title,
                description,
                pubDate: item.pubDate,
                link: item.guid,
            };
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title,
        link,
        description,
        item: items,
    };
};
