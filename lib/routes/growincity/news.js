const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id || '48';

    const rootUrl = 'http://www.growincity.com';
    const currentUrl = `${rootUrl}?page_id=11112&qfyuuid=qfy_posts_grid_s6lpz&q_term=${id}&q_type=post`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.link_title')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    item.description = content('div[qfyuuid="qfy_column_text_view_rgnpn"]').html();
                    item.pubDate = new Date(detailResponse.data.match(/>发布时间：<\/span>(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/)[1]).toUTCString();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: "城农资讯观点 - 城农 Growin' City",
        link: currentUrl,
        item: items,
    };
};
