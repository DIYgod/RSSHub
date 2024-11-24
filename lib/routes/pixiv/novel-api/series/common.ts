import got from '../../pixiv-got';
import { maskHeader } from '../../constants';
import queryString from 'query-string';
import { AppNovelSeries } from './types';

export default async function getNovelSeries(seriesId: string, offset: number, token: string): Promise<AppNovelSeries> {
    const rsp = await got('https://app-api.pixiv.net/v2/novel/series', {
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
        searchParams: queryString.stringify({
            series_id: seriesId,
            last_order: offset,
        }),
    });
    return rsp.data as AppNovelSeries;
}
