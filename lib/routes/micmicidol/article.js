const Cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

async function loadArticle(link) {
    const resp = await got(link);
    const article = Cheerio.load(resp.body);
    const matchResult = article('#post-header-top > script')
        .html()
        .match(/var timestamp="\w+,(.+)";/i)[1]
        .trim();
    // "August 20, 2021"
    const pubDate = parseDate(matchResult + ' +0000', 'MMMM D, YYYY Z');
    return {
        title: article('.entry-title').text().trim(),
        description: article('.post-body.entry-content').html(),
        pubDate,
        link,
    };
}
module.exports = loadArticle;
