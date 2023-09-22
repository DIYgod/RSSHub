const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { type = 'standard' } = ctx.params;

    const link = `https://osu.ppy.sh/beatmaps/packs?type=${type}`;

    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const itemList = $('.beatmap-pack');

    ctx.state.data = {
        title: `osu! Beatmap Pack - ${type}`,
        link,
        item: itemList.toArray().map((element) => {
            const item = $(element);
            const title = item.find('.beatmap-pack__name').text().trim();
            const link = item.find('.beatmap-pack__header').attr('href');
            // Trying to get the description will return 429 (Too Many Requests).
            const description = item.find('.beatmap-pack__body').html();
            const pubDate = parseDate(item.find('.beatmap-pack__date').text(), 'YYYY-MM-DD');
            const author = item.find('.beatmap-pack__author--bold').text().trim();

            return {
                title,
                link,
                description,
                pubDate,
                author,
            };
        }),
    };
};
