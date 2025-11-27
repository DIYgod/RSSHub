import queryString from 'query-string';

import { maskHeader } from '../constants';
import got from '../pixiv-got';

/**
 * 获取用户插画作品
 * @param {string} user_id 目标用户id
 * @param {string} token pixiv oauth token
 * @returns {Promise<got.AxiosResponse<{illusts: illust[]}>>}
 */
export default function getIllusts(user_id, token) {
    return got('https://app-api.pixiv.net/v1/user/illusts', {
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
        searchParams: queryString.stringify({
            user_id,
            filter: 'for_ios',
        }),
    });
}
