const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const url = `https://www.ershicimi.com/a/${id}`;
    const response = await got(url);
    const $ = cheerio.load(response.data);
    const items = $('.weui_media_box')
        .map((_, ele) => {
            const $item = cheerio.load(ele);
            return {
                title: $item('.weui_media_title a').text(),
                link: $item('.weui_media_title a').attr('href'),
                pubDate: new Date($item('.weui_media_extra_info').attr('title')).toUTCString(),
            };
        })
        .get();
    ctx.state.data = {
        title: `微信公众号 - ${$('span.name').text()}`,
        link: url,
        description: $('div.Profile-sideColumnItemValue').text(),
        item: items,
    };
};
