const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const ProcessFeed = async (list, caches, host) => {
    const requestList = [];

    const result = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const itemUrl = url.resolve(host, $('a').attr('href'));

            const cache = await caches.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title: $('a span').text(),
                link: itemUrl,
                guid: itemUrl,
            };

            const es = got.get(itemUrl);
            requestList.push(es);
            return Promise.resolve(single);
        })
    );

    const responses = await got.all(requestList);

    for (let i = 0; i < responses.length; i++) {
        const $ = cheerio.load(responses[i].data);

        $('.ssdd a').each(function () {
            if ($(this).attr('href')) {
                $(this).attr('href', url.resolve(host, $(this).attr('href')));
            }
        });
        $('.ssdd img').each(function () {
            if ($(this).attr('src')) {
                $(this).attr('src', url.resolve(host, $(this).attr('src')));
            }
        });
        result[i].description = $('.ssdd').html();

        const date = new Date(
            $('.zz span:nth-child(2)')
                .text()
                .match(/\d{4}-\d{2}-\d{2}/)
        );

        const timeZone = 8;
        const serverOffset = date.getTimezoneOffset() / 60;
        result[i].pubDate = new Date(date.getTime() - 60 * 60 * 1000 * (timeZone + serverOffset)).toUTCString();
        caches.set(result[i].link, JSON.stringify(result[i]));
    }

    return result;
};

module.exports = {
    ProcessFeed,
};
