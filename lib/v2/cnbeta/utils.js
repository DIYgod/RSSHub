const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'https://www.cnbeta.com';

module.exports = {
    rootUrl,
    ProcessItems: async (items, limit, tryGet) =>
        await Promise.all(
            items.slice(0, limit ? parseInt(limit) : 50).map((item) =>
                tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = cheerio.load(detailResponse.data);

                    content('.topic, .article-topic, .article-global').remove();

                    item.description = content('.article-summary').html() + content('.article-content').html();
                    item.author = content('header.title div.meta span.source').text();

                    return item;
                })
            )
        ),
};
