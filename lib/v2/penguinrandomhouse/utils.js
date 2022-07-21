const cheerio = require('cheerio');
const got = require('@/utils/got');

const parseList = async (items, ctx) =>
    await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.url, async () => {
                const itemRes = await got({
                    method: 'get',
                    url: item.url,
                });

                const itemPage = itemRes.data;
                const $ = cheerio.load(itemPage);

                const description = $('h2.read-down-text>p').first().text();

                const result = {
                    title: item.title,
                    description: description + $('#mainblock').html(),
                    link: item.url,
                };

                return result;
            })
        )
    );

module.exports = {
    parseList,
};
