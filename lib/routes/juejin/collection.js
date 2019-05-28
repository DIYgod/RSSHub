const axios = require('@/utils/axios');
const util = require('./utils');

module.exports = async (ctx) => {
    const collectionId = ctx.params.collectionId;

    const collectPage = await axios({
        method: 'get',
        url: `https://collection-set-ms.juejin.im/v1/getCollectionSetEntries?page=0&csId=${collectionId}&rankType=new&src=web`,
        headers: {
            Referer: `https://juejin.im/collection/${collectionId}`,
        },
    });

    // 获取收藏夹文章内容
    const urlArg = collectPage.data.d.join('|');
    const posts = await axios({
        method: 'get',
        url: `https://timeline-merger-ms.juejin.im/v1/get_entry_by_ids?src=web&page=0&pageSize=10&entryIds=${encodeURI(urlArg)}`,
        headers: {
            Referer: `https://juejin.im/collection/${collectionId}`,
        },
    });

    let items = [];
    if (posts.data.d && posts.data.d.entrylist) {
        items = posts.data.d.entrylist.slice(0, 10);
    }

    const result = await util.ProcessFeed(items, ctx.cache);

    ctx.state.data = {
        title: '掘金 - 单个收藏夹',
        link: `https://juejin.im/collection/${collectionId}`,
        description: '掘金，用户单个收藏夹',
        item: result,
    };
};
