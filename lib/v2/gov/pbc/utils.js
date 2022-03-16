const got = require('@/utils/got');
const cheerio = require('cheerio');

const processItems = async (list, ctx) =>
    await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got.post(item.link);
                const content = cheerio.load(detailResponse.data);

                item.description = content('div.xxy_text').html();

                return item;
            })
        )
    );

module.exports = {
    processItems,
};
