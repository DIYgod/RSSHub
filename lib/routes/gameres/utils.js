const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx, currentUrl, query) => {
    const rootUrl = `https://www.gameres.com`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $(query)
        .slice(0, 20)
        .map((_, item) => {
            item = $(item);
            item = item.parent().get(0).tagName === 'a' ? item.parent() : item.children();

            return {
                link: `${rootUrl}${item.attr('href')}`,
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

                const description = content('#maincontent');
                const info = description.prev().text().trim().split('\n');
                info.pop();
                const pubDate = info.pop();

                item.description = description.html();
                item.title = content('.article-title').text();
                item.pubDate = new Date(pubDate).toUTCString();
                item.author = info.join(' ').replace(/作者：/, '').replace(/原创/, '');

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: rootUrl,
        item: items,
    };
};
