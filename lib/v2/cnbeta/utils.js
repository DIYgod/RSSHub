const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'https://www.cnbeta.com.tw';

module.exports = {
    rootUrl,
    ProcessItems: (items, limit, tryGet) =>
        Promise.all(
            items.slice(0, limit ? parseInt(limit) : 60).map((item) =>
                tryGet(item.link, async () => {
                    const detailResponse = await got(item.link);

                    const content = cheerio.load(detailResponse.data);

                    content('.topic, .article-topic, .article-global').remove();

                    item.description = content('.article-summary').html() + content('.article-content').html();
                    item.author = content('header.title div.meta span.source').text();

                    return item;
                })
            )
        ),
};
