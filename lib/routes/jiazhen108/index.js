const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'http://www.jiazhen108.com/news/';
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('div.met-news-list ul li')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: a.attr('href'),
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

                    item.description = content('section.met-editor').html();
                    item.pubDate = new Date(content('div.info span').eq(0).text() + ' GMT+8').toUTCString();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `「108将」实战分享`,
        link: rootUrl,
        item: items,
    };
};
