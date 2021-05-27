const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const rootUrl = 'http://www.wuhan.gov.cn';
    const currentUrl = `${rootUrl}/sy/whyw/index.shtml`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = response.data
        .match(/url = "\.(.*)"/g)
        .slice(0, 10)
        .map((item) => ({
            link: `${rootUrl}/sy/whyw${item.match(/url = "\.(.*)"/)[1]}`,
        }));

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    item.description = content('.TRS_Editor').html();
                    item.title = content('meta[name="ArticleTitle"]').attr('content');
                    item.pubDate = timezone(new Date(content('meta[name="PubDate"]').attr('content')), +8);

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: '武汉要闻 - 武汉市人民政府',
        link: currentUrl,
        item: items,
    };
};
