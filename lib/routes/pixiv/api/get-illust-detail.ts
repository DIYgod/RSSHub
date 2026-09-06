import queryString from 'query-string';

import { maskHeader } from '../constants';
import got from '../pixiv-got';

/**
 * 获取插画详细信息
 * @param {string} illust_id 插画作品 id
 * @param {string} token pixiv oauth token
 * @returns {Promise<got.AxiosResponse<{illust: IllustDetail}>>}
 */
export default function getIllustDetail(illust_id: string, token: string) {
    return got('https://app-api.pixiv.net/v1/illust/detail', {
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
        searchParams: queryString.stringify({
            illust_id,
            filter: 'for_ios',
        }),
    });
}
