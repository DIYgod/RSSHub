const axios = require('../../utils/axios');
const util = require('./utils');

module.exports = async (ctx) => {
  const userId = ctx.params.userId;
// async function foo (ctx) {
  // const userId = '5b69762cf265da0f774ad677';
  const response = await new axios({
    method: 'get',
    url: `https://collection-set-ms.juejin.im/v1/getUserCollectionSet?src=web&page=0&pageSize=30&targetUserId=${userId}`, // userId
    headers: {
      Referer: `https://juejin.im/user/${userId}/collections` // userId
    }
  });

  // 获取用户所有收藏夹id
  const collectionId = response.data.d.collectionSets.map((item) => item.csId);

  // 获取所有收藏夹文章内容
  async function getPostId (item) {
    const collectPage = await axios({
      method: 'get',
      url: `https://collection-set-ms.juejin.im/v1/getCollectionSetEntries?page=0&csId=${item}&rankType=new&src=web`,
      headers: {
        Referer: `https://juejin.im/collection/${item}`
      }
    });
    const urlArg = collectPage.data.d.join('|');
    const posts = await axios({
      method: 'get',
      url: `https://timeline-merger-ms.juejin.im/v1/get_entry_by_ids?src=web&page=0&pageSize=20&entryIds=${encodeURI(urlArg)}`,
      headers: {
        Referer: `https://juejin.im/collection/${item}`
      }
    });
    return (posts.data.d && posts.data.d.entrylist) || [];
  }

  const temp = await Promise.all(collectionId.map(getPostId));
  const posts = [];
  temp.forEach((item) => {
    posts.push(...item);
  });

  const result = await util.ProcessFeed(posts, ctx.cache);

  ctx.state.data = {
    title: '掘金 - 收藏集',
    link: `https://juejin.im/user/${userId}/collections`,
    description: '掘金指定用户收藏集',
    item: result
  };
};

// foo();