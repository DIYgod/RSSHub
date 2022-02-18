const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

// Processing full text
async function load(link) {
    const responce = await got.get(link);
    const $ = cheerio.load(responce.data);
    const author = $('div[class=articleAuthor] p span').eq(1).text().slice(5);
    // Extracting text
    const description = $('div[id^=vsb_content]').html();

    return {
        description,
        author,
    };
}

const ProcessFeed = (list, cache) => {
    const host = 'http://news.bwu.edu.cn/';

    return Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('a').text();
            const link = url.resolve(host, $('a').attr('href'));
            // Parsing the date
            const date = new Date(
                $('span[class=rightDate]')
                    .text()
                    .match(/\d{4}-\d{2}-\d{2}/)
            );
            const timeZone = 8;
            const serverOffset = date.getTimezoneOffset() / 60;
            const pubDate = new Date(date.getTime() - 60 * 60 * 1000 * (timeZone + serverOffset)).toUTCString();

            const single = {
                title,
                link,
                guid: link,
                pubDate,
            };
            // Try caching
            const other = await cache.tryGet(link, () => load(link));
            // Return article information
            return Promise.resolve(Object.assign({}, single, other));
        })
    );
};

module.exports = {
    ProcessFeed,
};
