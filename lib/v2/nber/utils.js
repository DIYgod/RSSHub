const got = require('@/utils/got');
const cheerio = require('cheerio');

async function getData(url) {
    const response = await got(url).json();
    return response.results;
}

function parseAuthor(authors) {
    return authors.map((author) => {
        const $ = cheerio.load(author);
        return {
            name: $('a').text(),
            link: $('a').attr('href'),
        };
    });
}

module.exports = {
    getData,
    parseAuthor,
};
