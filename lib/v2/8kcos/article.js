const Cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

async function loadArticle(link) {
    const resp = await got(link);
    const article = Cheerio.load(resp.body);
    const entryChildren = article('div.entry-content').children();
    const imgs = entryChildren
        .find('noscript')
        .toArray()
        .map((e) => e.children[0].data);
    const txt = entryChildren
        .slice(2)
        .toArray()
        .map((e) => Cheerio.load(e).html());
    return {
        title: article('.entry-title').text(),
        description: imgs.concat(txt).join(''),
        pubDate: parseDate(article('time')[0].attribs.datetime),
        link,
    };
}
module.exports = loadArticle;
