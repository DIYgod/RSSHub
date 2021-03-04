const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const lang = ctx.params.lang || '';

    const rootUrl = 'https://clb.org.hk';
    const currentUrl = `${rootUrl}/${lang === '' ? '/zh-hans/section/%E8%AF%84%E8%AE%BA%E4%B8%8E%E7%89%B9%E5%86%99' : 'commentary-and-analysis'}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);

    const list = $('.field-content a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
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

                    item.description = content('.field-name-body').html();
                    item.pubDate = new Date(content('meta[property="article:published_time"]').attr('content')).toUTCString();

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
