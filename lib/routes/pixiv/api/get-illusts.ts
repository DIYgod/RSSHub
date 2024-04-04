import got from '../pixiv-got';
import { maskHeader } from '../constants';
import queryString from 'query-string';

/**
 * 获取用户插画作品
 * @param {string} user_id 目标用户id
 * @param {string} token pixiv oauth token
 * @returns {Promise<got.AxiosResponse<{illusts: illust[]}>>}
 */
export async function getIllusts(user_id, token, limit) {
    let offset = 0;
    const illusts = new Array<any>();
    let response;
    let illustsAmount = 0;

    do {
        response = await got('https://app-api.pixiv.net/v1/user/illusts', {
            headers: {
                ...maskHeader,
                Authorization: 'Bearer ' + token,
            },
            searchParams: queryString.stringify({
                user_id,
                filter: 'for_ios',
                offset,
            }),
        });
        illustsAmount = response.data.illusts.length;
        for (const element of response.data.illusts) {
            illusts.push(element);
        }
        offset += illustsAmount;
    } while (illustsAmount === 30 && offset < limit);

    return illusts;
}
