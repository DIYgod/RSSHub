const cheerio = require('cheerio');
const got = require('@/utils/got');
const config = require('@/config').value;
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const link = 'https://fishshell.com/docs/current/relnotes.html';
    const data = await ctx.cache.tryGet(link, async () => (await got(link)).data, config.cache.contentExpire, false);
    const $ = cheerio.load(data);
    ctx.state.data = {
        link,
        title: 'Release notes — fish-shell',
        language: 'en',
        item: $('#release-notes > section')
            .map((_, item) => {
                const title = $(item).find('h2').contents().first().text();
                const date = title.match(/\(released (.+?)\)/)?.[1];
                return {
                    title,
                    link: new URL($(item).find('a').attr('href'), link).href,
                    pubDate: date ? parseDate(date, 'MMMM D, YYYY') : undefined,
                    description: $(item).html(),
                };
            })
            .get(),
    };
};
