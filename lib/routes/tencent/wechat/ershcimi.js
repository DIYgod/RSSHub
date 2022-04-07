const got = require('@/utils/got');
const cheerio = require('cheerio');
const { finishArticleItem } = require('@/utils/wechat-mp');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const rootUrl = 'https://www.cimidata.com';

    const url = `${rootUrl}/a/${id}`;
    const response = await got(url);
    const $ = cheerio.load(response.data);
    const items = $('.weui_media_box')
        .map((_, ele) => {
            const $item = cheerio.load(ele);
            const link = $item('.weui_media_title a').attr('href');
            return {
                title: $item('.weui_media_title a').text(),
                description: $item('.weui_media_desc').text(),
                link,
                pubDate: new Date($item('.weui_media_extra_info').attr('title')).toUTCString(),
            };
        })
        .get();

    await Promise.all(items.map(async (item) => await finishArticleItem(ctx, item)));

    ctx.state.data = {
        title: `微信公众号 - ${$('span.name').text()}`,
        link: url,
        description: $('div.Profile-sideColumnItemValue').text(),
        item: items,
    };
};
