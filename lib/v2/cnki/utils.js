const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');

const ProcessItem = async (item) => {
    const detailResponse = await got(item.link);
    const $ = cheerio.load(detailResponse.data);
    item.description = art(path.join(__dirname, 'templates/desc.art'), {
        author: $('h3.author > span')
            .map((_, item) => $(item).text())
            .get()
            .join(' '),
        company: $('a.author')
            .map((_, item) => $(item).text())
            .get()
            .join(' '),
        content: $('div.row > span.abstract-text').parent().text(),
    });

    return item;
};

module.exports = {
    ProcessItem,
};
