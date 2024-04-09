const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://api.biligame.com/news/list?gameExtensionId=267&positionId=2&typeId=&pageNum=1&pageSize=5`,
    });
    const data = response.data;
    ctx.state.data = {
        title: '公主链接国服-最新公告',
        link: 'https://game.bilibili.com/pcr/news.html',
        item: data
            ? await Promise.all(
                  data.data.map(async (item) => ({
                      title: item.title,
                      description: await ctx.cache.tryGet(`pcrcn_${item.id}`, async () => {
                          const resp = await got({ method: 'get', url: `https://api.biligame.com/news/${item.id}` });
                          return resp.data.data.content;
                      }),
                      link: `https://game.bilibili.com/pcr/news.html#detail=${item.id}`,
                      pubDate: item.ctime ? item.ctime : item.createTime,
                  }))
              )
            : {
                  title: '获取失败！',
              },
    };
};
