const got = require('@/utils/got');
const maskHeader = require('../constants').maskHeader;
const queryString = require('query-string');

/**
 * 获取用户插画作品
 * @param {string} user_id 目标用户id
 * @param {string} token pixiv oauth token
 * @returns {Promise<got.AxiosResponse<{illusts: illust[]}>>}
 */
module.exports = async function getIllusts(user_id, token) {
    return await got({
        method: 'get',
        url: 'https://app-api.pixiv.net/v1/user/illusts',
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
        searchParams: queryString.stringify({
            user_id: user_id,
            filter: 'for_ios',
            type: 'illust',
        }),
    });
};
