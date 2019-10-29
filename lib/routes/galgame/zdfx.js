const got = require('@/utils/got');
const cheerio = require('cheerio');
const host = 'https://bbs.zdfx.net/';

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: host,
    });
    const $ = cheerio.load(response.data);
    const list = $('.slideother a');

    const process = list.map((index, item) => {
        const a = $(item);
        const img_tag = '.slideshow a:nth-child(' + (index + 1).toString() + ')';

        return {
            title: a.text(),
            description: $(img_tag).html(),
            link: host + a.attr('href'),
        };
    });

    ctx.state.data = {
        title: '终点分享',
        link: host,
        description: '终点分享最新汉化通知',
        item: process.get(),
    };
};
