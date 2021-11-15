import got from '~/utils/got.js';
import cheerio from 'cheerio';
import url from 'url';

import {RUBY_CHINA_HOST} from './constants.js';

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

function processTopics2Feed(list, cache) {
    return Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const $title = $('.title a');

            const itemUrl = url.resolve(RUBY_CHINA_HOST, $title.attr('href'));
            const itemFeed = await cache.tryGet(itemUrl, async () => await loadAndParseTopic(itemUrl));

            return itemFeed;
        })
    );
}

export default {
    processTopics2Feed,
};
