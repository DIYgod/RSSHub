const axios = require('../../../utils/axios');
const maskHeader = require('../constants').maskHeader;

/**
 * 按时间排序搜索内容
 * @param {string} keyword 关键词
 * @param {string} token pixiv oauth token
 * @returns {Promise<axios.AxiosResponse<{illusts: illust[]}>>}
 */
module.exports = async function searchIllust(keyword, token) {
    return await axios({
        method: 'get',
        url: 'https://app-api.pixiv.net/v1/search/illust',
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
        params: {
            word: keyword,
            search_target: 'partial_match_for_tags',
            sort: 'date_desc',
            filter: 'for_ios',
        },
    });
};
