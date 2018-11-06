const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');

const ProcessFeed = async (list, caches) => {
    const host = 'https://www.jianshu.com';

    const requestList = [];

    const result = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const itemUrl = url.resolve(host, $('.title').attr('href'));

            const cache = await caches.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title: $('.title').text(),
                link: itemUrl,
                author: $('.nickname').text(),
                guid: itemUrl,
            };

            const es = axios.get(itemUrl);
            requestList.push(es);
            return Promise.resolve(single);
        })
    );

    const responses = await axios.all(requestList);

    for (let i = 0; i < responses.length; i++) {
        const $ = cheerio.load(responses[i].data);

        result[i].description = $('.show-content-free').html();

        const date = new Date(
            $('.publish-time')
                .text()
                .match(/\d{4}.\d{2}.\d{2} \d{2}:\d{2}/)
        );

        const timeZone = 8;
        const serverOffset = date.getTimezoneOffset() / 60;
        result[i].pubDate = new Date(date.getTime() - 60 * 60 * 1000 * (timeZone + serverOffset)).toUTCString();
        caches.set(result[i].link, JSON.stringify(result[i]), 1 * 60 * 60);
    }

    return result;
};

module.exports = {
    ProcessFeed,
};
