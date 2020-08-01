const cheerio = require('cheerio');
const got = require('hooman');

exports.processFeed = async function processFeed(link) {
    const response = await got.get(link);
    const $ = cheerio.load(response.body);
    const list = $('ul#image-list li');

    return (
        list &&
        list
            .map((index, item) => {
                item = $(item);
                return {
                    title: item.find('.image-list-item-title').text(),
                    link: item.find('.image-list-item-title > a').attr('href'),
                    description: item
                        .find('.image-list-item-image')
                        .html()
                        .replace(/\/p=\d+x\d+/, ''),
                    pubDate: new Date(item.find('.image-list-item-regist-date').text()),
                };
            })
            .get()
    );
};
