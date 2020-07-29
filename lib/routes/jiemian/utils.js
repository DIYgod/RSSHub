const cheerio = require('cheerio');

const ProcessFeed = (out, responses) => {
    for (let i = 0; i < responses.length; i++) {
        const $ = cheerio.load(responses[i].data);

        let time = $('.article-info span.date')[0];

        time = time ? time.firstChild.data : $('div.article-info > p > span:nth-child(2)').text();

        out[i].pubDate = new Date(time).toUTCString();

        $('.article-view .article-main')
            .find('div.share-view, script')
            .each((i, e) => {
                $(e).remove();
            });

        out[i].description = $('.article-view .article-main').html();
    }
    return out;
};

module.exports = {
    ProcessFeed,
};
