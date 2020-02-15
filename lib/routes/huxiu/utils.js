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

                $('.article__content')
                    .find('.lazyImg')
                    .each((i, e) => {
                        $(e).attr('src', $(e).attr('_src'));
                    });

                $('.article__content')
                    .find('.text-big-title')
                    .each((i, e) => (e.tagName = 'h3'));

                return {
                    title: $('.article__title')
                        .text()
                        .trim(),
                    description: $('.article__top-img-video') + $('.article__content').html(),
                    pubDate: date($('.article__time').text(), 8),
                    author: $('.author-info__username').text(),
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
