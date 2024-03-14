import got from '../pixiv-got';
import { maskHeader } from '../constants';
import queryString from 'query-string';

export default function getNovelContent(id, token) {
    return got('https://app-api.pixiv.net/webview/v2/novel', {
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
        searchParams: queryString.stringify({
            id,
        }),
    });
}
