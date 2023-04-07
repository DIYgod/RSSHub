const got = require('@/utils/got');
const cheerio = require('cheerio');

function parseElement(element) {
    const $ = cheerio.load(element);
    const title = $('h2.entry-title > a').text();
    const link = $('div.entry-summary').eq(-1).attr('href');
    const description = $.html();
    return {
        title,
        link,
        description,
    };
}

async function parsePage(url) {
    const response = await got(url);
    const $ = cheerio.load(response.data);
    const title = $('head > title').text();
    const items = $('article').get().map(parseElement);
    return {
        title,
        items,
    };
}

module.exports = {
    parseElement,
    parsePage,
};
