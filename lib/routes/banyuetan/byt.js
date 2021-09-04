const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const time = ctx.params.time || 'shishidashiku';

    const rootUrl = 'http://www.banyuetan.org';
    const currentUrl = `${rootUrl}/byt/${time}/index.html`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.byt_mian_image_list_con ul li a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                link: item.attr('href'),
                title: item.attr('title'),
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

                    item.description = content('#detail_content').html();
                    item.author = content('.detail_tit_source').text().replace('来源：', '');
                    item.pubDate = new Date(content('meta[property="og:release_date"]').attr('content')).toUTCString();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
