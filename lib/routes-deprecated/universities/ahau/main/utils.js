const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

async function load(link) {
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const date = new Date(
        $('.info')
            .text()
            .match(/\d{4}-\d{2}-\d{2}/)
    );
    const timeZone = 8;
    const serverOffset = date.getTimezoneOffset() / 60;
    const pubDate = new Date(date.getTime() - 60 * 60 * 1000 * (timeZone + serverOffset)).toUTCString();

    const description = $('#vsb_content > .v_news_content').html();

    return { description, pubDate };
}

const ProcessFeed = (list, caches) => {
    const host = 'http://news.ahau.edu.cn/';

    return Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const $title_href = $('a');
            const $title = $('a span').text().trim();
            const itemUrl = url.resolve(host, $title_href.attr('href'));

            const single = {
                title: $title,
                link: itemUrl,
                author: '安农大新闻',
                guid: itemUrl,
            };

            const other = await caches.tryGet(itemUrl, () => load(itemUrl));

            return Object.assign({}, single, other);
        })
    );
};

module.exports = {
    ProcessFeed,
};
