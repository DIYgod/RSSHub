const Cheerio = require('cheerio');
const got = require('got');
async function loadArticle(link) {
    const resp = await got(link);
    const article = Cheerio.load(resp.body);
    const title = article('.entry-title').text();
    const entry_children = article('div.entry-content').children().toArray();
    const imgs = Cheerio.load(entry_children.shift()).text(); // 去除懒加载代码减少返回体积
    const txt = Cheerio.load(entry_children).html();
    return {
        title,
        description: imgs.concat(txt),
        pubDate: article('time')[0].attribs.datetime.replace('>', ''),
        link,
    };
}
module.exports = loadArticle;
