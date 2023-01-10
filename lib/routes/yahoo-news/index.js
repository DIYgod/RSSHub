const got = require('@/utils/got');
const parser = require('@/utils/rss-parser');
const cheerio = require('cheerio');
const { isValidHost } = require('@/utils/valid-host');

module.exports = async (ctx) => {
    const region = ctx.params.region === 'en' ? '' : ctx.params.region.toLowerCase() + '.';
    if (!isValidHost(region)) {
        throw Error('Invalid region');
    }
    const category = ctx.params.category ? ctx.params.category.toLowerCase() : '';
    const rssUrl = `https://${region}news.yahoo.com/rss/${category}`;
    const feed = await parser.parseURL(rssUrl);
    const title = feed.title;
    const link = feed.link;
    const description = feed.description;
    const filteredItems = feed.items.filter((item) => !item.link.includes('promotions') && item.link.includes('yahoo.com'));
    const items = await Promise.all(
        filteredItems.map(async (item) => {
            const description = await ctx.cache.tryGet(item.link, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                });

                const $ = cheerio.load(response.data);
                const $descriptionRoot = cheerio.load('<div><div class="img-root"></div><div class="content-root"></div></div>');
                $descriptionRoot('div.img-root').append($('article img:not(header img)'));
                $descriptionRoot('div.content-root').append($('article p').removeAttr('content'));
                return $descriptionRoot.html();
            });
            const single = {
                title: item.title,
                description,
                pubDate: item.pubDate,
                link: item.link,
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
