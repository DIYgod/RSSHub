const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

async function load(link) {
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const date = new Date(
        $('.introTime span:nth-of-type(2)')
            .text()
            .match(/\d{4}-\d{2}-\d{2}/)
    );
    const timeZone = 8;
    const serverOffset = date.getTimezoneOffset() / 60;
    const pubDate = new Date(date.getTime() - 60 * 60 * 1000 * (timeZone + serverOffset)).toUTCString();

    const description = $('#vsb_content > .v_news_content').html();

    return { description, pubDate };
}

const ProcessFeed = async (list, caches) => {
    const host = 'http://jwc.ahau.edu.cn/';

    return await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const $title = $('a');
            const $title_pretty = $title.attr('title').trim();
            const itemUrl = url.resolve(host, $title.attr('href'));

            const single = {
                title: $title_pretty,
                link: itemUrl,
                author: '安农大教务处',
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
