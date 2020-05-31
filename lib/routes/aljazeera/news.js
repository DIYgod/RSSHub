const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = `https://chinese.aljazeera.net/news`;
    const response = await got({
        method: 'get',
        url: link,
    });
    const $ = cheerio.load(response.data);

    const list = $('h3 a')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: url.resolve(`https://chinese.aljazeera.net`, item.attr('href')),
            };
        })
        .get();

    ctx.state.data = {
        title: `Aljazeera半岛网 - 新闻`,
        link: link,
        item: await Promise.all(
            list.map(
                async (item) =>
                    await ctx.cache.tryGet(item.link, async () => {
                        const detailResponse = await got({ method: 'get', url: item.link });
                        const content = cheerio.load(detailResponse.data);
                        item.pubDate = new Date(detailResponse.data.match(/"datePublished": "(.*?)",/)[1]).toUTCString();
                        item.description = content('div.wysiwyg').html();
                        return item;
                    })
            )
        ),
    };
};
