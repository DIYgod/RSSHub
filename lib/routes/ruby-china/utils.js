const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const { RUBY_CHINA_HOST } = require('./constants');

async function loadAndParseTopic(link) {
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const title = $('.topic-detail .title').text();
    const author = $('.topic-detail .user-name').text();
    const description = $('.topic-detail .card-body').html();
    const pubDate = new Date();

    return {
        title,
        link,
        author,
        guid: link,
        description,
        pubDate,
    };
}

async function processTopics2Feed(list, cache) {
    return await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const $title = $('.title a');

            const itemUrl = url.resolve(RUBY_CHINA_HOST, $title.attr('href'));
            const itemFeed = await cache.tryGet(itemUrl, () => loadAndParseTopic(itemUrl));

            return itemFeed;
        })
    );
}

module.exports = {
    processTopics2Feed,
};
