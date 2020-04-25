const got = require('@/utils/got'); // get web content
const cheerio = require('cheerio'); // html parser

const domain = 'http://www.ltaaa.com';

module.exports = async function get_article(url) {
    if (/^\/.*$/.test(url)) {
        url = domain + url;
    }
    const response = await got({
        method: 'get',
        url: url,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:62.0) Gecko/20100101 Firefox/62.0',
        responseType: 'buffer',
    });
    const data = response.data;
    const $ = cheerio.load(data);

    const title = $('div.post-title > h1').text();
    const author = $('div.post-param > a').text();
    const pub_date_raw = $('div.post-param').clone().children().remove().end().text();
    let date = new Date(pub_date_raw);
    date.setHours(date.getHours() - 8);
    date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
    const content = $('div.post-content').html() + '<br/><hr/><br/>' + $('div.post-comment').html();

    const item = {
        title: title,
        pubDate: date.toUTCString(),
        author: author,
        link: url,
        description: content,
    };
    return item;
};
