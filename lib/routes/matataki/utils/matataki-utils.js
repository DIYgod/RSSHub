const got = require('@/utils/got');

/**
 *  Matataki 官网地址
 */
const MATATAKI_WEB_URL = 'https://www.matataki.io/';

/**
 *  IPFS网关的URL。可以换成其他公共网关，也可以换成自建的网关地址
 */
// const IPFS_GATEWAY_URL = 'https://ipfs.io';
// const IPFS_GATEWAY_URL = 'https://cf-ipfs.com';
const IPFS_GATEWAY_URL = 'https://10.via0.com';

/**
 * 以`get` 方式调用Matataki API的简单封装
 *
 * @param {string} url
 */
async function get(url) {
    return await got({
        method: 'get',
        url: url,
        headers: {
            Referer: MATATAKI_WEB_URL,
        },
    });
}
exports.IPFS_GATEWAY_URL = IPFS_GATEWAY_URL;

exports.get = get;

/**
 * 获取用户信息昵称
 *
 * @param {number} userId
 */
exports.getUserNickname = async (userId) => {
    try {
        const userInfoResponse = await get(`https://api.smartsignature.io/user/${userId}`);
        return `${userInfoResponse.data.data.nickname || userInfoResponse.data.data.username}`;
    } catch (err) {
        return '';
    }
};

/**
 * 获取Fan票名称
 *
 * @param {number} tokenId
 */
exports.getTokenName = async (tokenId) => {
    try {
        const tokenInfoResponse = await get(`https://api.smartsignature.io/minetoken/${tokenId}`);
        return `${tokenInfoResponse.data.data.token.name}`;
    } catch (err) {
        return '';
    }
};

/**
 * 获取Matataki作品在IPFS上的Hash
 *
 * @param {number} postId
 */
exports.getPostIpfsHtmlHash = async (postId) => {
    const ipfsInfoResponse = await get(`https://api.smartsignature.io/p/${postId}/ipfs`);
    return `${ipfsInfoResponse.data.data[0].htmlHash}`;
};

/**
 * 将Matataki作品条目转为指向IPFS网关的RSS订阅源条目
 *
 * @param {Object} item
 */
exports.postToIpfsFeedItem = async (item) => {
    const ipfsHtmlHash = await this.getPostIpfsHtmlHash(item.id);

    return {
        title: `${item.title} - ${item.nickname || item.author}${item.token_name ? ' $' + item.token_name : ''}`,
        description: item.short_content,
        link: `${IPFS_GATEWAY_URL}/ipfs/${ipfsHtmlHash}`,
        pubDate: item.create_time,
        guid: ipfsHtmlHash,
    };
};

/**
 * 将Matataki作品条目转为指向官网的RSS订阅源条目
 *
 * @param {Object} item
 */
exports.postToFeedItem = (item) => ({
    title: `${item.title} - ${item.nickname || item.author}${item.token_name ? ' $' + item.token_name : ''}`,
    description: item.short_content,
    link: `https://www.matataki.io/p/${item.id}`,
    pubDate: item.create_time,
});

/**
 * 获取作品列表并转为Feed Item数组
 *
 * @param {string} url Matataki作品相关API的url
 * @param {ipfsFlag} ipfsFlag 是否取IPFS地址
 */
exports.getPostsAsFeedItems = async (url, ipfsFlag) => {
    const response = await get(url);
    if (ipfsFlag) {
        return await Promise.all(response.data.data.list.map(this.postToIpfsFeedItem));
    }
    return response.data.data.list.map(this.postToFeedItem);
};
