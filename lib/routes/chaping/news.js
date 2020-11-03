const got = require('@/utils/got');

const titles = {
    0: '全部',
    15: '直播',
    3: '科技新鲜事',
    7: '互联网槽点',
    5: '趣味科技',
    6: 'DEBUG TIME',
    1: '游戏',
    8: '视频',
    9: '公里每小时',
};

module.exports = async (ctx) => {
    ctx.params.caty = ctx.params.caty || '';

    const targetUrl = `https://chaping.cn/news?cate=${ctx.params.caty}`;
    const currentUrl = `https://chaping.cn/api/official/information/news?page=1&limit=16&cate=${ctx.params.caty}`;
    const apiResponse = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = apiResponse.data.data.map((item) => ({
        title: item.title,
        link: `https://chaping.cn/news/${item.id}`,
        pubDate: new Date(item.time_publish_timestamp * 1000).toUTCString(),
    }));

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = JSON.parse(detailResponse.data.match(/"current":(.*?),"optionsList":/)[1]);

                    item.description = content.content;

                    return item;
                })
        )
    );

    ctx.params.caty = ctx.params.caty === '' ? 0 : ctx.params.caty;

    ctx.state.data = {
        title: `差评资讯 - ${titles[ctx.params.caty]}`,
        link: targetUrl,
        item: items,
    };
};
