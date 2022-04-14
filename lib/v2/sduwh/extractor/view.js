const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (link, ctx) =>
    await ctx.cache.tryGet(link, async () => {
        try {
            const result = await got.get(link);
            const $ = cheerio.load(result.data);
            const content = $('#vsb_content').html();
            const author = $("form[name='_newscontent_fromname'] > div > p:last-of-type").text();
            return { description: content, author };
        } catch (e) {
            return {};
        }
    });
