const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const topic = ctx.params.topic;

    const response = await got({
        method: 'get',
        url: `https://www.apnews.com/${topic}`,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('div.FeedCard');

    ctx.state.data = {
        title: $('title').text(),
        link: `https://www.apnews.com/${topic}`,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);

                    return {
                        title: item
                            .find('h1[class^=Component-h1]')
                            .first()
                            .text(),
                        author: item
                            .find('span[class^=Component-bylines]')
                            .first()
                            .text()
                            .replace('By ', ''),
                        description: item
                            .find('div.content')
                            .first()
                            .text(),
                        pubDate: item.find('span[class^="Timestamp Component-root"]').attr('data-source'),
                        link: item.find('a[class^=Component-headline]').attr('href'),
                    };
                })
                .get(),
    };
};
