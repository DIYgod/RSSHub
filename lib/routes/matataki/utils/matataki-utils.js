const got = require('@/utils/got');

/**
 *  Matataki API 地址
 */
const MTATAKI_API_URL = 'https://api.mttk.net';

/**
 *  Matataki 官网地址
 */
const MATATAKI_WEB_URL = 'https://www.matataki.io/';

/**
 *  IPFS网关的URL。可以换成其他公共网关，也可以换成自建的网关地址
 */
const IPFS_GATEWAY_URL = 'https://10.via0.com';

/**
 * 以`get` 方式调用Matataki API的简单封装
 *
 * @param {string} path 以 / 开始
 */
async function get(path) {
    return await got({
        method: 'get',
        url: MTATAKI_API_URL + path,
        headers: {
            Referer: MATATAKI_WEB_URL,
        },
    });
}

/**
 * 获取用户信息昵称
 *
 * @param {number} userId
 */
async function getUserNickname(userId) {
    try {
        const userInfoResponse = await get(`/user/${userId}`);
        return `${userInfoResponse.data.data.nickname || userInfoResponse.data.data.username}`;
    } catch (err) {
        return '';
    }
}

/**
 * 获取Fan票名称
 *
 * @param {number} tokenId
 */
async function getTokenName(tokenId) {
    try {
        const tokenInfoResponse = await get(`/minetoken/${tokenId}`);
        return `${tokenInfoResponse.data.data.token.name}`;
    } catch (err) {
        return '';
    }
}

/**
 * 获取Matataki作品在IPFS上的Hash
 *
 * @param {number} postId
 */
async function getPostIpfsHtmlHash(postId) {
    const ipfsInfoResponse = await get(`/p/${postId}/ipfs`);
    return `${ipfsInfoResponse.data.data[0].htmlHash}`;
}

/**
 * 将Matataki作品条目转为指向IPFS网关的RSS订阅源条目
 *
 * @param {Object} item
 */
async function postToIpfsFeedItem(item) {
    const ipfsHtmlHash = await getPostIpfsHtmlHash(item.id);

    return {
        title: `${item.title} - ${item.nickname || item.author}${item.token_name ? ' $' + item.token_name : ''}`,
        description: item.short_content,
        link: `${IPFS_GATEWAY_URL}/ipfs/${ipfsHtmlHash}`,
        pubDate: item.create_time,
        guid: ipfsHtmlHash,
    };
}

/**
 * 将Matataki作品条目转为指向官网的RSS订阅源条目
 *
 * @param {Object} item
 */
async function postToFeedItem(item) {
    return {
        title: `${item.title} - ${item.nickname || item.author}${item.token_name ? ' $' + item.token_name : ''}`,
        description: item.short_content,
        link: `https://www.matataki.io/p/${item.id}`,
        pubDate: item.create_time,
    };
}

/**
 * 获取作品列表并转为Feed Item数组
 *
 * @param {string} url Matataki作品相关API的url
 * @param {ipfsFlag} ipfsFlag 是否取IPFS地址
 */
async function getPostsAsFeedItems(url, ipfsFlag) {
    const response = await get(url);
    if (ipfsFlag) {
        return await Promise.all(response.data.data.list.map(postToIpfsFeedItem));
    }
    return response.data.data.list.map(postToFeedItem);
}

module.exports = {
    IPFS_GATEWAY_URL,
    get,
    getUserNickname,
    getTokenName,
    getPostIpfsHtmlHash,
    postToIpfsFeedItem,
    postToFeedItem,
    getPostsAsFeedItems,
};
