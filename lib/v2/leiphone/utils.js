const cheerio = require('cheerio');
const got = require('@/utils/got');
const dateParser = require('@/utils/dateParser');
const url = require('url');

const ProcessFeed = async (list, cache) => {
    const host = 'https://www.leiphone.com';

    const items = await Promise.all(
        list.map(async (e) => {
            const link = url.resolve(host, e);

            const single = await cache.tryGet(link, async () => {
                const response = await got.get(link);

                const $ = cheerio.load(response.data);

                let description = '';
                if ($('.top-img').html() !== null) {
                    description += $('.top-img').html();
                }

                return {
                    title: $('.headTit').text(),
                    description: description + $('.article-lead').text() + $('.lph-article-comView').html(),
                    pubDate: dateParser($('.time').text(), 8),
                    author: $('.aut > a').text(),
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
