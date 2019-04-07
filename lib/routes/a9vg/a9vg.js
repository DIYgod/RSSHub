const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'http://www.a9vg.com/list/news',
        headers: {
            Referer: 'http://www.a9vg.com/list/news',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.vd-flexbox.vdp-direction_column.vdp-align_stretch.is-gap li');

    ctx.state.data = {
        title: 'A9VG电玩部落',
        link: 'http://www.a9vg.com/list/news',
        description: '电玩资讯_电玩动态- A9VG电玩部落',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.vd-flexbox.a9-rich-card-list_label.is-size18.is-top8').text(),
                        description: item.find('.vd-flexbox.vdp-direction_column.vdp-align_stretch.vdp-gap_small .a9-rich-card-list_summary').text() + '<img src="' + item.find('.vd-flexbox.vdp-flex_none img').attr('src') + '">',
                        pubDate: new Date(item.find('.time').data('shared-at')).toUTCString(),
                        link: 'http://www.a9vg.com' + item.find('a').attr('href'),
                    };
                })
                .get(),
    };
};
