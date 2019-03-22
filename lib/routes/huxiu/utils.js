const cheerio = require('cheerio');
const date = require('../../utils/date');
const axios = require('../../utils/axios');
const url = require('url');

const ProcessFeed = async (list, cache) => {
    const host = 'https://www.huxiu.com';

    const items = await Promise.all(
        list.map(async (e) => {
            const link = url.resolve(host, e);

            const single = await cache.tryGet(
                link,
                async () => {
                    const response = await axios.get(link);

                    const $ = cheerio.load(response.data);
                    $('.neirong-shouquan, .neirong-shouquan-public').remove();

                    return {
                        title: $('.t-h1')
                            .text()
                            .trim(),
                        description: $('.article-img-box').html() + $('.article-content-wrap').html(),
                        pubDate: date($('.article-time').text(), 8),
                        author: $('.article-author .author-name').text(),
                        link,
                    };
                },
                2 * 24 * 60 * 60
            );

            return Promise.resolve(single);
        })
    );

    return items;
};

module.exports = {
    ProcessFeed,
};
