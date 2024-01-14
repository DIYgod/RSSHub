const got = require('@/utils/got');
const util = require('./utils');

/**
 * Get all posts by collection_id
 * @param {String} collection_id
 * @returns {any[]} posts
 */
const getPostList = async (collection_id) => {
    const postList = [];
    let cursor = '0';

    let has_more = true;
    while (has_more) {
        // eslint-disable-next-line no-await-in-loop
        const res = await got({
            method: 'post',
            url: `https://api.juejin.cn/interact_api/v2/collectionset/detail?spider=0`,
            json: {
                collection_id,
                cursor,
                limit: 10,
            },
        }).json();

        postList.push(...res.data.articles);

        if (res.has_more) {
            cursor = res.cursor;
        } else {
            has_more = false;
            break;
        }
    }

    return postList;
};

module.exports = async (ctx) => {
    const { collectionId } = ctx.params;

    const posts = await getPostList(collectionId);

    const result = await util.ProcessFeed(posts, ctx.cache);

    ctx.state.data = {
        title: '掘金 - 单个收藏夹',
        link: `https://juejin.cn/collection/${collectionId}`,
        description: '掘金，用户单个收藏夹',
        item: result,
        allowEmpty: true,
    };
};
