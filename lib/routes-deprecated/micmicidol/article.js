const Cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const regStripAnchor = /(?:<br\/?> *)?<a name="more"\/?><\/a>(?: *<br\/?>)?/i;

async function loadArticle(link) {
    const resp = await got(link);
    const $ = Cheerio.load(resp.body);
    const matchResult = $('#post-header-top > script')
        .html()
        .match(/var timestamp="\w+,(.+)";/i)[1]
        .trim();
    // Ex. "August 20, 2021"
    const pubDate = parseDate(matchResult + '+0000', 'MMMM D, YYYYZ');

    const labels = $('.post-labels a')
        .text()
        .split('\n')
        .filter((item) => item !== '');
    return {
        title: $('.entry-title').text().trim(),
        description: $('.post-body.entry-content').html().replace(regStripAnchor, ''),
        category: labels,
        pubDate,
        link,
    };
}
module.exports = loadArticle;
