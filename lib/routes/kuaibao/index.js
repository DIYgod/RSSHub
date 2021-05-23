const got = require('@/utils/got');

module.exports = async (ctx) => {
    const currentUrl = 'http://kuaibao.qq.com/n/getKbMainpageInfo';
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const articleList = response.data.newslist.map((item) => ({
        title: item.title,
        link: `https://kuaibao.qq.com/getSubNewsContent?id=${item.id}&style=json`,
        pubDate: new Date(item.time).toUTCString(),
    }));

    ctx.state.data = {
        title: '看点快报 - 首页',
        link: 'http://kuaibao.qq.com/',
        item: await Promise.all(
            articleList.map(
                async (item) =>
                    await ctx.cache.tryGet(item.link, async () => {
                        const contentResponse = await got({
                            method: 'get',
                            url: item.link,
                        });
                        item.link = contentResponse.data.url || contentResponse.data.short_url;
                        item.description = contentResponse.data.content.text;
                        return item;
                    })
            )
        ),
    };
};
