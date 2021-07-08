const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const cat = ctx.params.cat;

    const rootUrl = 'http://www.cac.gov.cn';
    const currUrl = rootUrl + '/' + cat + '/More.htm';
    const response = await got({
        method: 'get',
        url: currUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('.xpage-container #loadingInfoPage li a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const link = item.attr('href');
            return {
                title: item.text(),
                link,
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

                    item.description = content('.TRS_Editor').html() || content('.article_con').html();
                    item.pubDate = new Date(content('meta[name="PubDate"]').attr('content') + ' GMT+8').toUTCString();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currUrl,
        item: items,
    };
};
