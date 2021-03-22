const Cheerio = require('cheerio');
const got = require('@/utils/got');
async function loadArticle(link) {
    const resp = await got(link);
    const article = Cheerio.load(resp.body);
    const title = article('.entry-title').text();
    const entry_children = article('div.entry-content').children();
    const imgs = entry_children.find('noscript').toArray().map((e) => e.children[0].data);
    const txt = entry_children.slice(2).toArray().map((e) => Cheerio.load(e).html());
    return {
        title,
        description: imgs.concat(txt).join(''),
        pubDate: article('time')[0].attribs.datetime.replace('>', ''),
        link,
    };
}
module.exports = loadArticle;
