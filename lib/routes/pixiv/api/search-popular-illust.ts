import queryString from 'query-string';

import { maskHeader } from '../constants';
import got from '../pixiv-got';

/**
 * 按热门排序搜索内容
 * @param {string} keyword 关键词
 * @param {string} token pixiv oauth token
 * @returns {Promise<got.AxiosResponse<{illusts: illust[]}>>}
 */
export default function searchPopularIllust(keyword, token) {
    return got('https://app-api.pixiv.net/v1/search/popular-preview/illust', {
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
        searchParams: queryString.stringify({
            word: keyword,
            search_target: 'partial_match_for_tags',
            filter: 'for_ios',
        }),
    });
}
