const got = require('@/utils/got');
const parser = require('@/utils/rss-parser');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const ProcessFeed = (content) => {
        // clean up the article
        content.find('div.o-share, aside, div.o-ads').remove();

        return content.html();
    };

    const link = `https://www.ft.com/myft/following/${ctx.params.key}.rss`;

    const feed = await parser.parseURL(link);

    const items = await Promise.all(
        feed.items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                    headers: {
                        Referer: 'https://www.facebook.com',
                    },
                });

                const $ = cheerio.load(response.data);

                item.description = ProcessFeed($('article.js-article__content-body'));
                item.category = JSON.parse($('script[type="application/ld+json"]').eq(1).text()).itemListElement.map((e) => e.name);
                item.author = $('a.n-content-tag--author').text();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `FT.com - myFT`,
        link,
        description: `FT.com - myFT`,
        item: items,
    };
};
