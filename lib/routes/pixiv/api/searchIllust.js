const got = require('../pixiv-got');
const maskHeader = require('../constants').maskHeader;
const queryString = require('query-string');

/**
 * 按时间排序搜索内容
 * @param {string} keyword 关键词
 * @param {string} token pixiv oauth token
 * @returns {Promise<got.AxiosResponse<{illusts: illust[]}>>}
 */
module.exports = async function searchIllust(keyword, token) {
    return await got({
        method: 'get',
        url: 'https://app-api.pixiv.net/v1/search/illust',
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
        searchParams: queryString.stringify({
            word: keyword,
            search_target: 'partial_match_for_tags',
            sort: 'date_desc',
            filter: 'for_ios',
        }),
    });
};
