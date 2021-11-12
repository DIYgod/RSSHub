const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://aflcio.org';
    const currentUrl = `${rootUrl}/blog`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('article')
        .map((_, item) => {
            item = $(item);
            const title = item.find('h1 a');
            return {
                title: title.text(),
                link: `${rootUrl}${title.attr('href')}`,
                pubDate: new Date(item.find('time').attr('datetime')).toUTCString(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                item.description = content('.section-article-body').html();
                item.author = detailResponse.data.match(/entityName":"(.*)","entityType"/)[1];

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
