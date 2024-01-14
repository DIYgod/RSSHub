const got = require('@/utils/got');
const util = require('./utils');

/**
 * Get all collection by loop
 * @param {String} user_id
 * @return {any[]} collectionSet
 */
const getCollectionList = async (user_id) => {
    const collectionList = [];
    let cursor = '0';

    let has_more = true;
    while (has_more) {
        // eslint-disable-next-line no-await-in-loop
        const res = await got({
            method: 'post',
            url: `https://api.juejin.cn/interact_api/v2/collectionset/list?spider=0`,
            json: {
                user_id,
                cursor,
                limit: 20,
            },
        }).json();

        collectionList.push(...res.data);

        if (res.has_more) {
            cursor = res.cursor;
        } else {
            has_more = false;
            break;
        }
    }

    return collectionList;
};

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
    const { userId } = ctx.params;

    // 获取用户所有收藏夹id
    const collectionList = await getCollectionList(userId);
    const collectionIds = collectionList.map((item) => item.collection_id);

    // 获取所有收藏夹文章内容
    const posts = (await Promise.all(collectionIds.map(getPostList))).flat();

    const result = await util.ProcessFeed(posts, ctx.cache);

    ctx.state.data = {
        title: '掘金 - 收藏集',
        link: `https://juejin.im/user/${userId}/collections`,
        description: '掘金，指定用户整个收藏集',
        item: result,
        allowEmpty: true,
    };
};
