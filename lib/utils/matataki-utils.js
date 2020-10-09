const got = require('@/utils/got');

const MATATAKI_WEB_URL = 'https://www.matataki.io/';
const IPFS_GATEWAY_URL = 'https://ipfs.io';

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
        return `${userInfoResponse.data.data.nickname}`;
    }
    catch (err) {
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
    }
    catch (err) {
        return '';
    }
};

/**
 * 获取Matataki文章在IPFS上的Hash
 *
 * @param {number} postId
 */
exports.getPostIpfsHtmlHash = async (postId) => {
    const ipfsInfoResponse = await get(`https://api.smartsignature.io/p/${postId}/ipfs`);
    return `${ipfsInfoResponse.data.data[0].htmlHash}`;
};

/**
 * 将Matataki文章条目转为指向IPFS网关的RSS订阅源条目
 * @param {Object} item
 */
exports.postToIpfsFeedItem = async (item) => {

    const ipfsHtmlHash = await this.getPostIpfsHtmlHash(item.id);

    return {
        title: `${item.title} - ${item.nickname}${item.token_name ? ' $' + item.token_name : ''}`,
        description: item.short_content,
        link: `${IPFS_GATEWAY_URL}/ipfs/${ipfsHtmlHash}`,
        guid: ipfsHtmlHash,
    };

};

/**
 *将Matataki文章条目转为指向官网的RSS订阅源条目
 * @param {Object} item
 */
exports.postToFeedItem = (item) => ({
    title: `${item.title} - ${item.nickname}`,
    description: item.short_content,
    link: `https://www.matataki.io/p/${item.id}`,
});

/**
 *
 * @param {string} url Matataki文章相关API的url
 */
exports.getPostIpfsFeedItems = async (url) => {
    const response = await get(url);
    return await Promise.all(response.data.data.list.map(this.postToIpfsFeedItem));
};

/**
 *
 * @param {string} url Matataki文章相关API的url
 */
exports.getPostFeedItems = async (url) => {
    const response = await get(url);
    return response.data.data.list.map(this.postToFeedItem);
};
