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
        feed.items.map(async (item) => {
            const response = await got({
                method: 'get',
                url: item.link,
                headers: {
                    Referer: 'https://www.facebook.com',
                },
            });

            const $ = cheerio.load(response.data);

            const single = {
                title: item.title,
                description: ProcessFeed($('div.article__content-body')),
                author: $('a.n-content-tag--author').text(),
                pubDate: item.pubDate,
                link: item.link,
            };
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `FT.com - myFT`,
        link,
        description: `FT.com - myFT`,
        item: items,
    };
};
