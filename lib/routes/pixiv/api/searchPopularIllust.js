const got = require('@/utils/got');
const maskHeader = require('../constants').maskHeader;

/**
 * 按热门排序搜索内容
 * @param {string} keyword 关键词
 * @param {string} token pixiv oauth token
 * @returns {Promise<got.AxiosResponse<{illusts: illust[]}>>}
 */
module.exports = async function searchPopularIllust(keyword, token) {
    return await got({
        method: 'get',
        url: 'https://app-api.pixiv.net/v1/search/popular-preview/illust',
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
        params: {
            word: keyword,
            search_target: 'partial_match_for_tags',
            filter: 'for_ios',
        },
    });
};
