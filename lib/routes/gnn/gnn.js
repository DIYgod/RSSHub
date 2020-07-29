const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://gnn.gamer.com.tw/',
        headers: {
            Referer: 'hhttps://gnn.gamer.com.tw/',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.GN-lbox2 .GN-lbox2B');

    ctx.state.data = {
        title: 'GNN 新聞網 - 巴哈姆特 edited by monner',
        link: 'https://gnn.gamer.com.tw/',
        description: '巴 哈 姆 特 電 玩 資 訊 站 https://www.gamer.com.tw',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.GN-lbox2D').text(),
                        description: item.find('.GN-lbox2C').text() + '<img src="' + item.find('.GN-lbox2E img').attr('src') + '">',
                        pubDate: new Date(item.find('.time').data('shared-at')).toUTCString(),
                        link: item.find('.GN-lbox2D a').attr('href'),
                    };
                })
                .get(),
    };
};
