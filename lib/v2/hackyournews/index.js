// Require necessary modules
const got = require('@/utils/got'); // a customised got
const cheerio = require('cheerio'); // an HTML parser with a jQuery-like API
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://hackyournews.com';
    const { data: response } = await got(baseUrl);
    const $ = cheerio.load(response);

    const item = $('tr.story')
        .map((_, story) => {
            const title = $(story).find('a').first().text();
            const nextRow = $(story).next();
            const metas = nextRow.text().trimStart().split('|');
            const upvotes = parseInt(metas[0].split(' points')[0].trim());
            const author = metas[0].split('by')[1].trim();
            const pubDate = parseDate(metas[1].trim());
            let category = [];
            // NOTE: If the summary is not already proceeded, we cannot get the category.
            if (metas.length === 5) {
                category = [metas[2].trim(), metas[3].trim()];
            }
            const a = nextRow.find('a');
            const link = a.attr('href');
            const comments = parseInt(a.text());
            const description = nextRow
                .find('p')
                .map((_, p) => $(p).text())
                .get()
                .join('<br>');
            return {
                title,
                link,
                author,
                category,
                comments,
                upvotes,
                pubDate,
                description,
            };
        })
        .get();

    ctx.state.data = {
        title: 'Index',
        link: baseUrl,
        item,
    };
};
