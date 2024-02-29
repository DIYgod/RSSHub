const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || 'tzgg';

    const rootUrl = 'http://www.jlbtc.edu.cn';
    const currentUrl = `${rootUrl}/${category}.htm`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.c44361')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}/${item.attr('href')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                item.description = content('#vsb_content, #vsb_content_2, #vsb_content_501').html();
                item.pubDate = new Date(detailResponse.data.match(/发布日期：(.*)&nbsp;供稿单位/)[1]).toUTCString();

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
