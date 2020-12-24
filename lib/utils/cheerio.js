const cheerio = require('cheerio');
const htmlparser2 = require('htmlparser2');

const cheerioLoad = cheerio.load;
cheerio.load = (html, options) => {
    const dom = htmlparser2.parseDocument(html);
    return cheerioLoad(dom, options);
};
module.exports = cheerio;
