const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'http://www.news.cn';
    const currentUrl = `${rootUrl}/whxw.htm`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('h3 a')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    try {
                        const detailResponse = await got({
                            method: 'get',
                            url: item.link,
                        });
                        const content = cheerio.load(detailResponse.data);

                        item.description = content('#detail').html();
                        item.pubDate = new Date(detailResponse.data.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/)[1] + ' GMT+8').toUTCString();

                        return item;
                    } catch (e) {
                        return Promise.resolve('');
                    }
                })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
