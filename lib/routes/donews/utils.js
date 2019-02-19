const cheerio = require('cheerio');
const axios = require('../../utils/axios');
const date = require('../../utils/date');

const ProcessFeed = async (link) => {
    const response = await axios.get(link);

    const $ = cheerio.load(response.data);

    const meta = $($('#main .fl')[0]);

    return {
        title: $('h1').text() || $($('h2')[1]).text(),
        author: meta.find('span:nth-child(1)').text(),
        description: $('.article-con').html(),
        pubDate: date(meta.find('span:nth-child(2)').text(), 8),
        link,
    };
};

module.exports = {
    ProcessFeed,
};
