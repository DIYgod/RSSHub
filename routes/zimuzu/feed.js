const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');
const mguri = require('magnet-uri');

const parseInfoHash = function(uri) {
    if (uri) {
        const uriObj = mguri.decode(uri);
        const hash = uriObj.infoHash || uri;
        if (/^[A-Za-z0-9]{40}$/.test(hash)) {
            return hash.toUpperCase();
        }
    }
};

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await axios({
        method: 'get',
        url: 'http://diaodiaode.me/rss/feed/' + id,
        headers: {
            'User-Agent': config.ua,
        },
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
                    const title = item.find('title').text();
                    const magnet = item.find('magnet').text();
                    if (parseInfoHash(magnet)) {
                        return {
                            title: title,
                            pubDate: item.find('pubDate').text(),
                            guid: item.find('guid').text(),
                            link: magnet,
                        };
                    }

                    return null;
                })
                .get(),
    };
};
