const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (link, ctx) =>
    await ctx.cache.tryGet(link, async () => {
        try {
            const result = await got(link);
            const $ = cheerio.load(result.data);
            const content = $('#main-content').html();
            const author = $('#source').text();
            return { description: content, author };
        } catch (e) {
            return {};
        }
    });
