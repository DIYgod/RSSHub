const got = require('../pixiv-got');
const maskHeader = require('../constants').maskHeader;
const queryString = require('query-string');

/**
 * 获取用户关注的画师们的最新插画
 * @param {string} token pixiv oauth token
 * @returns {Promise<got.AxiosResponse<{illusts: illust[]}>>}
 */
module.exports = function getUserIllustFollows(token) {
    return got('https://app-api.pixiv.net/v2/illust/follow', {
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
        searchParams: queryString.stringify({
            restrict: 'public',
        }),
    });
};
