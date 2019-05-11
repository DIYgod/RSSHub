const cheerio = require('cheerio');

const ProcessFeed = (data) => {
    const $ = cheerio.load(data);
    const content = $('div[itemprop="articleBody"]');

    const cover = $('meta[property="og:image"]');
    if (cover.length > 0) {
        $(`<img referrerpolicy="no-referrer" src=${cover[0].attribs.content}>`).insertBefore(content[0].firstChild);
    }

    // remove useless DOMs
    content
        .find('hr')
        .nextAll()
        .remove();

    content.find('hr, ins.adsbygoogle, script').each((i, e) => {
        $(e).remove();
    });

    content.find('div').each((i, e) => {
        if ($(e)[0].attribs.class) {
            const classes = $(e)[0].attribs.class;
            if (classes.match(/\w{10}\s\w{10}/g)) {
                $(e).remove();
            }
        }
    });

    return content.html();
};

module.exports = {
    ProcessFeed,
};
