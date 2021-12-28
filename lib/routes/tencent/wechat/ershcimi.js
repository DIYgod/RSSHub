const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const url = `https://www.ershicimi.com/a/${id}`;
    const response = await got(url);
    const $ = cheerio.load(response.data);
    const list = $('.weui_media_box')
        .map((_, ele) => {
            const $item = cheerio.load(ele);
            return {
                title: $item('.weui_media_title a').text(),
                description: $item('.weui_media_desc').text(),
                link: `https://www.ershicimi.com${$item('.weui_media_title a').attr('href')}`,
                pubDate: new Date($item('.weui_media_extra_info').attr('title')).toUTCString(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailRepsonse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailRepsonse.data);

                item.description = content('.article-content').html() ? content('.article-content').html() : item.description;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `微信公众号 - ${$('span.name').text()}`,
        link: url,
        description: $('div.Profile-sideColumnItemValue').text(),
        item: items,
    };
};
