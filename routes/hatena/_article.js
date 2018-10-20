const axios = require('../../utils/axios'); // get web content
const cheerio = require('cheerio'); // html parser

module.exports = async function get_article(url) {
    const response = await axios({
        method: 'get',
        url: url,
    });
    const data = response.data;

    const $ = cheerio.load(data);
    const link = $('meta[property="og:url"]').attr('content');
    const author = $('span.fn').attr('data-user-name');
    const title = $('h1.entry-title').text();
    const pub_date_raw = $('span.entry-footer-time > a > time').attr('datetime');
    const pub_date = new Date(Date.parse(pub_date_raw)).toUTCString();
    const content = $('div.entry-content')
        .html()
        .replace(/<!\[CDATA\[/g, '<!--')
        .replace(/\]\]>/g, '-->');

    const item = {
        title: title,
        author: author,
        pubDate: pub_date,
        link: link,
        description: content,
    };
    return item;
};
