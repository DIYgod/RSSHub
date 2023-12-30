const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

// Processing full text
async function load(link) {
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const author = $('div[class=articleAuthor] p span').eq(1).text() || 'null';
    const authorName = author.indexOf(':') !== -1 ? author.split(':')[1].trim() : author;
    const validAuthor = 'xcb@bwu.edu.cn (' + authorName + ')';
    // Extracting text
    const description = $('div[id^=vsb_content]').html();

    return {
        description,
        author: validAuthor,
    };
}

const ProcessFeed = (list, cache) => {
    const host = 'https://news.bwu.edu.cn/';

    return Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const aTag = $('a');
            const title = aTag.text();
            const link = new URL(aTag.attr('href'), host);
            // Parsing the date
            const pubDate = timezone(parseDate($('span[class=rightDate]').text(), 'YYYY-MM-DD'), +8);

            const single = {
                title,
                link,
                guid: link,
                pubDate,
            };
            // Try caching
            const other = await cache.tryGet(link, () => load(link));
            // Return article information
            return { ...single, ...other };
        })
    );
};

module.exports = {
    ProcessFeed,
};
