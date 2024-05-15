const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseRelativeDate } = require('@/utils/parse-date');

const ProcessFeed = async (info) => {
    const title = info.title;
    const itemUrl = info.link;
    const itemDate = info.date;

    const response = await got.get(itemUrl);

    const $ = cheerio.load(response.data);
    const description = $('#topic_content').html().trim();

    const single = {
        title,
        link: itemUrl,
        description,
        pubDate: parseRelativeDate(itemDate),
    };
    return single;
};

module.exports = {
    ProcessFeed,
};
