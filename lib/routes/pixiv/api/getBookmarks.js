const got = require('@/utils/got');
const maskHeader = require('../constants').maskHeader;
const queryString = require('query-string');

/**
 * 获取用户的收藏
 *
 * @param {string} user_id 目标用户id
 * @param {string} token pixiv oauth token
 * @returns {Promise<got.AxiosResponse<{illusts: illust[]}>>}
 */
module.exports = async function getBookmarks(user_id, token) {
    return await got({
        method: 'get',
        url: 'https://app-api.pixiv.net/v1/user/bookmarks/illust',
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
        searchParams: queryString.stringify({
            user_id: user_id,
            restrict: 'public',
        }),
    });
};
