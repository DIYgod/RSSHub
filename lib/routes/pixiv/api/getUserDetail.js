const got = require('../pixiv-got');
const maskHeader = require('../constants').maskHeader;
const queryString = require('query-string');

/**
 * pixiv 用户
 * @typedef {{user: {id: number, name: string, account: string, profile_image_urls: any, comment: string}, profile: any} userDetail
 */

/**
 * 获取用户信息
 *
 * @param {string} user_id 目标用户id
 * @param {string} token pixiv oauth token
 * @returns {Promise<got.AxiosResponse<userDetail>>}
 */
module.exports = function getUserDetail(user_id, token) {
    return got({
        method: 'get',
        url: 'https://app-api.pixiv.net/v1/user/detail',
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
        searchParams: queryString.stringify({
            user_id,
        }),
    });
};
