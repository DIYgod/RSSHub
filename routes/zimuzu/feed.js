const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const session = ctx.params.session;

    const response = await axios({
        method: 'get',
        url: 'http://diaodiaode.me/rss/feed/' + id,
    });

    const data = response.data;
    const $ = cheerio.load(data, {
        xmlMode: true,
    });
    const list = $('item');

    ctx.state.data = {
        title: $('channel>title').text(),
        link: encodeURI('http://www.zimuzu.tv/resource/' + id),
        description: $('channel>description').text(),
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    title = item.find('title').text();
                    if (title.indexOf(session) != -1) {
                        return {
                            title: title,
                            pubDate: item.find('pubDate').text(),
                            guid: item.find('guid').text(),
                            link: item.find('magnet').text(),
                        };
                    }
                })
                .get(),
    };
};
