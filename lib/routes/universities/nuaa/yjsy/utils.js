const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

async function load(link) {
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    // DATE
    const date = new Date(
        $('td[height=30]')
            .text()
            .match(/\d{4}-\d{2}-\d{2}/)
    );
    const timeZone = 8;
    const serverOffset = date.getTimezoneOffset() / 60;
    const pubDate = new Date(date.getTime() - 60 * 60 * 1000 * (timeZone + serverOffset)).toUTCString();

    const description = $('.wp_articlecontent').html();

    return { description, pubDate };
}

const ProcessFeed = async (list, caches) => {
    const host = 'http://www.graduate.nuaa.edu.cn/';

    return await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const $title = $('a');
            const itemUrl = url.resolve(host, $title.attr('href'));

            const single = {
                title: $title.text(),
                link: itemUrl,
                author: '南航研究生院',
                guid: itemUrl,
            };

            const other = await caches.tryGet(itemUrl, async () => await load(itemUrl));

            return Promise.resolve(Object.assign({}, single, other));
        })
    );
};

module.exports = {
    ProcessFeed,
};
