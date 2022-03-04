const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://photo.cctv.com';
    const currentUrl = `${rootUrl}/jx/`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.textr a')
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
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                item.description = content('.tujitop').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '央视网图片《镜象》',
        link: currentUrl,
        item: items,
    };
};
