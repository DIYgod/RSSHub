const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://dayoneapp.com';
    const currentUrl = `${rootUrl}/blog`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('h3 a')
        .slice(0, 20)
        .map((_, item) => {
            item = $(item);
            const info = item.parent().next().text().split(' by ');

            return {
                author: info[1],
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
                pubDate: new Date(info[0]).toUTCString(),
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

                const description = content('.blog-layout');

                description.children().last().remove();
                content('h1').next().remove();
                content('h1').remove();

                item.description = description.html();

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
