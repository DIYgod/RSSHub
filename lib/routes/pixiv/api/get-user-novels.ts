import got from '../pixiv-got';
import { maskHeader } from '../constants';
import queryString from 'query-string';

export default function getUserNovels(user_id, token) {
    return got('https://app-api.pixiv.net/v1/user/novels', {
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
        searchParams: queryString.stringify({
            user_id,
        }),
    });
}
