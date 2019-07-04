const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://appfan.im/api/v2/priceDrop'
    });

    const data = response.data;

    ctx.state.data = {
        title: '每日限免精选',
        link: 'https://shimo.im/docs/syZ2cGCVC5gVb39G',
        description: '每日限免精选',
        item:data.apps.map((item) => ({
          // 文章标题
          title: `[$${item.priceTo}]${item.name}`,
          // 文章正文
          description: `原价:$${item.priceFrom} 评分:${item.rating || '?'}<br>设备:${item.platform} 类型:${item.genre}<br><img referrerpolicy="no-referrer" src="${item.artwork}">`,
          // 文章发布时间
          pubDate: new Date(data.modified).toUTCString(),
          // 文章链接
          link: `https://itunes.apple.com/cn/app/id${item.id}`,
      })),
    };
};
