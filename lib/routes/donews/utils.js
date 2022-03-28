const cheerio = require('cheerio');
const got = require('@/utils/got');

const ProcessFeed = async (link) => {
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    return {
        title: $('.detail-con h1').text() || $('.detail-con h2').text().replace('{{news.title}}', ''),
        author: $('.tag > .fl > span:nth-child(2)').text().replace('{{news.author}}', ''),
        description: $('.article-con').html(),
        pubDate: new Date($('.tag > .fl > span:nth-child(1)').text().replace('{{news.timeFormat}}', '')),
        link,
    };
};

module.exports = {
    ProcessFeed,
};
