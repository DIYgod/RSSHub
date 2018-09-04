const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'https://what-if.xkcd.com/feed.atom',
        headers: {
            Referer: 'https://xkcd.com/',
        },
    });

    const data = response.data;
    const $ = cheerio.load(data, {
        xmlMode: true,
    });
    const list = $('entry');

    ctx.state.data = {
        title: 'what-if',
        link: 'https://what-if.xkcd.com/',
        description: "xkcd' article",
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('title').text(),
                        description: item.find('content').text(),
                        pubDate: item.find('updated').text(),
                        link: item.find('id').text(),
                    };
                })
                .get(),
    };
};
