const cheerio = require('cheerio');

const ProcessFeed = (data) => {
    const $ = cheerio.load(data);
    const content = $('div.content__article-body');

    // remove useless DOMs
    content.find('aside, .ad-slot, .after-article, .contributions__epic, .submeta').each((i, e) => {
        $(e).remove();
    });

    if ($('#img-1').length > 0) {
        // there is a cover photo
        const photo = $('#img-1').find('img');

        let cover = `<figure><img alt='${photo[0].attribs.alt}' src='${photo[0].attribs.src}'><br><figcaption>`;

        const caption = $('#img-1').find('figcaption');

        cover += `${$(caption[0])
            .text()
            .trim()}</figcaption></figure>`;

        $(cover).insertBefore(content[0].firstChild);
    }

    return content.html();
};

module.exports = {
    ProcessFeed,
};
