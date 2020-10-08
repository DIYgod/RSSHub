const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    ctx.params.order = ctx.params.order || '';
    ctx.params.keyword = ctx.params.keyword || '';
    ctx.params.caty = ctx.params.caty || '';

    const rootUrl = `http://xinsheng.huawei.com/cn/index.php?app=forum&mod=List&class=461&order=${ctx.params.order}&search=${ctx.params.keyword}&cate=${ctx.params.caty}`;
    const response = await got({
        method: 'get',
        url: rootUrl,
    });
    const $ = cheerio.load(response.data);

    $('a[linktag="__subject_link__"]').remove();

    const list = $('.bbs_list ul li .font_box .title p font a')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.attr('title'),
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

                    item.description = content('.bbs_info_right_text').eq(0).html();
                    item.pubDate = new Date(content('span.fl').eq(0).text().trim() + ' GMT+8').toUTCString();
                    item.author = content('.bbs_info_user_ a').eq(1).text();

                    return item;
                })
        )
    );

    let title;

    $('.bbs_list_box_title_wz ul li').each(function () {
        if ($(this).hasClass('on')) {
            title = $(this).text();
            return;
        }
    });

    ctx.state.data = {
        title: `${title} - 华为家事 - 心声社区`,
        link: rootUrl,
        item: items,
    };
};
