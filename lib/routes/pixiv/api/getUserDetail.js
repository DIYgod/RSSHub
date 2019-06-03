const axios = require('@/utils/axios');
const maskHeader = require('../constants').maskHeader;

/**
 * pixiv 用户
 * @typedef {{user: {id: number, name: string, account: string, profile_image_urls: any, comment: string}, profile: any} userDetail
 */

/**
 * 获取用户信息
 *
 * @param {string} user_id 目标用户id
 * @param {string} token pixiv oauth token
 * @returns {Promise<axios.AxiosResponse<userDetail>>}
 */
module.exports = async function getUserDetail(user_id, token) {
    return await axios({
        method: 'get',
        url: 'https://app-api.pixiv.net/v1/user/detail',
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
        params: {
            user_id: user_id,
        },
    });
};
