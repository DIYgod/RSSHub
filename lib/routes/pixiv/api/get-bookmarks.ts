import got from '../pixiv-got';
import { maskHeader } from '../constants';
import queryString from 'query-string';

/**
 * 获取用户的收藏
 *
 * @param {string} user_id 目标用户id
 * @param {string} token pixiv oauth token
 * @returns {Promise<got.AxiosResponse<{illusts: illust[]}>>}
 */
export default function getBookmarks(user_id, token) {
    return got('https://app-api.pixiv.net/v1/user/bookmarks/illust', {
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
        searchParams: queryString.stringify({
            user_id,
            restrict: 'public',
        }),
    });
}
