const cheerio = require('cheerio');


const parseContent = (htmlString) => {
    const $ = cheerio.load(htmlString);

    const author = $('.main > a:first-child');
    const time = $('span.ts-words.space');
    const content = $('.image-holder');


    return {
        author: author.text().trim(),
        description: content.html(),
        pubDate: time.text().trim(),
    };
};

module.exports = {
    parseContent,
};
