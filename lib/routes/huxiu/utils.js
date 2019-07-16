const cheerio = require('cheerio');
const date = require('@/utils/date');
const got = require('@/utils/got');
const url = require('url');

const ProcessFeed = async (list, cache) => {
    const host = 'https://www.huxiu.com';

    const items = await Promise.all(
        list.map(async (e) => {
            const link = url.resolve(host, e);

            const single = await cache.tryGet(link, async () => {
                const response = await got.get(link);

                const $ = cheerio.load(response.data);

                return {
                    title: $('.article__title')
                        .text()
                        .trim(),
                    description: $('.article__top-img-video') + $('.article__content').html(),
                    pubDate: date($('.article__bottom-content__right .article__time').text(), 8),
                    author: $('.article__author-info-box .author-info__username').text(),
                    link,
                };
            });

            return Promise.resolve(single);
        })
    );

    return items;
};

module.exports = {
    ProcessFeed,
};
