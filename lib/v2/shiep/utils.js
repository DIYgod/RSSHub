const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

async function load(link) {
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const description = art(path.join(__dirname, 'templates/description.art'), {
        description: $('.wp_articlecontent').html(),
    });
    return { description };
}

const ProcessFeed = (host, list, pubDateClass, caches) =>
    Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const itemUrl = new URL($('a').attr('href'), host).href;
            const fetched = {
                title: $('a').attr('title') || $('a').text(),
                link: itemUrl,
                guid: itemUrl,
                pubDate: parseDate($(pubDateClass).text().trim(), 'YYYY-MM-DD'),
            };
            const cached = await caches.tryGet(itemUrl, () => load(itemUrl));
            return Promise.resolve(Object.assign({}, fetched, cached));
        })
    );

module.exports = {
    ProcessFeed,
};
