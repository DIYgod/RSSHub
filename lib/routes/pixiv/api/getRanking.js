const got = require('@/utils/got');
const maskHeader = require('../constants').maskHeader;
const assert = require('assert');
const queryString = require('query-string');

const allowMode = ['day', 'week', 'month', 'day_male', 'day_female', 'week_original', 'week_rookie', 'day_r18', 'day_male_r18', 'day_female_r18', 'week_r18', 'week_r18g'];

/**
 * 获取某天的排行榜
 * @param {string} mode 模式
 * @param {Date} date 日期
 * @param {string} token pixiv oauth token
 * @returns {Promise<got.AxiosResponse<{illusts: illust[]}>>}
 */
module.exports = async function getRanking(mode, date, token) {
    assert(allowMode.includes(mode), 'Mode not allow.');
    return await got({
        method: 'get',
        url: 'https://app-api.pixiv.net/v1/illust/ranking',
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
        searchParams: queryString.stringify({
            mode: mode,
            filter: 'for_ios',
            ...(date && {
                date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
            }),
        }),
    });
};
