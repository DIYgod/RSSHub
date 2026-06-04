import assert from 'node:assert';

import queryString from 'query-string';

import { maskHeader } from '../constants';
import got from '../pixiv-got';

const allowMode = new Set(['day', 'week', 'month', 'day_male', 'day_female', 'day_ai', 'week_original', 'week_rookie', 'day_r18', 'day_r18_ai', 'day_male_r18', 'day_female_r18', 'week_r18', 'week_r18g']);

/**
 * 获取某天的排行榜
 * @param {string} mode 模式
 * @param {Date} date 日期
 * @param {string} token pixiv oauth token
 * @returns {Promise<got.AxiosResponse<{illusts: illust[]}>>}
 */
export default function getRanking(mode, date, token) {
    assert.ok(allowMode.has(mode), 'Mode not allow.');
    return got('https://app-api.pixiv.net/v1/illust/ranking', {
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
        searchParams: queryString.stringify({
            mode,
            filter: 'for_ios',
            ...(date && {
                date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
            }),
        }),
    });
}
