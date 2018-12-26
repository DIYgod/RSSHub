const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'https://github.com/DIYgod/RSSHub/releases.atom',
        headers: {
            Referer: 'https://github.com/DIYgod/RSSHub',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data, {
        xmlMode: true,
    });
    const list = $('entry');

    ctx.state.data = {
        title: 'RSSHub 有新的 RSS 支持',
        link: 'https://github.com/DIYgod/RSSHub',
        description: '万物皆可 RSS',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('title').text(),
                        description: item.find('content').text(),
                        pubDate: item.find('updated').text(),
                        link: item.find('link').attr('href'),
                    };
                })
                .get(),
    };
};
