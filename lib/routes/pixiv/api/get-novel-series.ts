import got from '../pixiv-got';
import { maskHeader } from '../constants';
import queryString from 'query-string';

export default function getNovelSeries(series_id, last_order, token) {
    return got('https://app-api.pixiv.net/v2/novel/series', {
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
        searchParams: queryString.stringify({
            series_id,
            last_order,
        }),
    });
}
