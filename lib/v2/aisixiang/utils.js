const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'http://www.aisixiang.com';

const ProcessFeed = (limit, tryGet, items) =>
    Promise.all(
        items.slice(0, limit).map((item) =>
            tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.author = content('strong').first().text();
                item.description = content('.article-content').html();
                item.pubDate = timezone(parseDate(content('.info').text().split('时间：').pop()), +8);
                item.category = content('u')
                    .first()
                    .parent()
                    .find('u')
                    .toArray()
                    .map((a) => content(a).text());

                return item;
            })
        )
    );

module.exports = {
    rootUrl,
    ProcessFeed,
};
