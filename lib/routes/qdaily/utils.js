const cheerio = require('cheerio');

const ProcessFeed = (data) => {
    const $ = cheerio.load(data);
    const content = $('div.article-detail-bd');

    // remove useless DOMs
    content.find('div.com-share-favor').each((i, e) => {
        $(e).remove();
    });

    if ($('div.article-detail-hd img.banner').length > 0) {
        // there is a cover photo
        const cover = $('div.article-detail-hd img.banner');
        $(cover).insertBefore(content[0].firstChild);
    }

    if ($('div.author').length > 0) {
        // credit to original author and translators
        const author = $('div.author span.name');
        const pub_date = $('div.author span.date');
        $(author).insertAfter(content[0].lastChild);
        $(pub_date).insertAfter(content[0].lastChild);
    }

    return content.html();
};

module.exports = {
    ProcessFeed,
};
