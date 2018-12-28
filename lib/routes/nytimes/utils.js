const cheerio = require('cheerio');

const ProcessFeed = (data) => {
    const $ = cheerio.load(data);
    const content = $('section.article-body');

    // remove useless DOMs
    content.find('div.big_ad, div.article-body-aside').each((i, e) => {
        $(e).remove();
    });

    if ($('figure.article-span-photo').length > 0) {
        // there is a cover photo
        const cover = $('figure.article-span-photo');
        $(cover).insertBefore(content[0].firstChild);
    }

    if ($('footer.author-info').length > 0) {
        // credit to original author and translators
        const footer = $('footer.author-info');
        $(footer).insertAfter(content[0].lastChild);
    }

    return content.html();
};

module.exports = {
    ProcessFeed,
};
