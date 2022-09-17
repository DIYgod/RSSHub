const got = require('@/utils/got'); // get web content
const cheerio = require('cheerio'); // html parser

const domain = 'http://sse.tongji.edu.cn';

module.exports = async function get_article(url) {
    if (/^\/.*$/.test(url)) {
        url = domain + url;
    }
    const response = await got({
        method: 'get',
        url,
    });
    const data = response.data;

    const $ = cheerio.load(data);
    const title = $('div.view-title').text();
    const pub_date_raw = $('div.view-info').text();
    const pub_date_parse = /\d{2,4}-\d{1,2}-\d{1,2}/.exec(pub_date_raw);
    const pub_date = new Date(pub_date_parse[0]).toUTCString();
    const content = $('div.view-cnt')
        .html()
        .replace(/<!\[CDATA\[/g, '<!--')
        .replace(/\]\]>/g, '-->')
        .replace(/href="\//g, 'href="' + domain + '/');

    const item = {
        title,
        pubDate: pub_date,
        link: url,
        description: content,
    };
    return item;
};
