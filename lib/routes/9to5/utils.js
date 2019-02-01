const cheerio = require('cheerio');

const ProcessFeed = (data) => {
    const $ = cheerio.load(data);
    const content = $('div[itemprop="articleBody"]');

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
            if (classes.match(/th\w{8}\sth\w{8}/g)) {
                $(e).remove();
            }
        }
    });

    return content.html();
};

module.exports = {
    ProcessFeed,
};
