const got = require('@/utils/got');

module.exports = async (ctx) => {
  const response = await got({
    method: 'get',
    url: 'https://eu.alienwarearena.com/esi/featured-tile-data/Giveaway'
  });

  const data = response.data;

  ctx.state.data = {
    title: 'Alienware Arena',
    link: 'https://eu.alienwarearena.com/ucf/Giveaway',
    description: 'Alienware Arena - Rise With Us',
    item: data.data.map((item) => ({
      // 文章标题
      title: item.title,
      // 文章正文
      description: `<p>${item.title}</p><img src="${item.image}" />`,
      // 文章发布时间
      pubDate: item.publishedAt,
      // 文章链接
      link: new URL(item.url, 'https://eu.alienwarearena.com/').href
    }))
  };
};
