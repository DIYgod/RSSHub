const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'http://www.chinanonfiction.com/';

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: baseUrl,
    });

    const $ = cheerio.load(response.body);
    const text = $('article').slice(0, 10);

    ctx.state.data = {
        title: '累牍',
        link: baseUrl,
        description: '最好看的长文章',
        item:
            text &&
            text
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item
                            .find('h2.entry-title')
                            .text()
                            .replace(/^\s+|\s+$/g, ''),
                        link: item.find('a').attr('href'),
                        description: item
                            .find('div.entry-summary')
                            .text()
                            .replace(/^\s+|\s+$/g, ''),
                        pubDate: item
                            .find('span.publish_time')
                            .text()
                            .replace(/^\s+|\s+$/g, ''),
                    };
                })
                .get(),
    };
};
