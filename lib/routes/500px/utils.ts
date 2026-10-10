import { config } from '@/config';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const baseUrl = 'https://500px.com.cn';

/*
ty_rum.server = {
    id: 'Fm3hXcTiLT8',
    ignore_err: true,
    beacon: 'beacon.tingyun.com',
    beacon_err: 'beacon-err.tingyun.com',
    key: 'M1laN7-zRM0',
    trace_threshold: 7000,
    custom_urls: [],
    sr: 1.0,
};
v && v.id && this._ty_rum && y(this._ty_rum.url) && (this._ty_rum.r = (new Date).getTime() % 1e8,
this.setRequestHeader && this.setRequestHeader("X-Tingyun-Id", v.id + ";r=" + this._ty_rum.r))
*/
const headers = {
    // {"anonymousId":"","latitude":null,"longitude":null,"manufacturer":"","province":"","area":"","city":""}
    'x-500px-client-info': 'eyJhbm9ueW1vdXNJZCI6IiIsImxhdGl0dWRlIjpudWxsLCJsb25naXR1ZGUiOm51bGwsIm1hbnVmYWN0dXJlciI6IiIsInByb3ZpbmNlIjoiIiwiYXJlYSI6IiIsImNpdHkiOiIifQ==',
    'X-Tingyun-Id': `Fm3hXcTiLT8;r=${Date.now() % 1e8}`,
};

const getTribeDetail = (id) =>
    cache.tryGet(
        `500px:tribeDetail:${id}`,
        async () => {
            const data = await ofetch(`${baseUrl}/community/tribe/tribeDetail`, {
                headers,
                query: {
                    tribeId: id,
                },
            });
            return data.data;
        },
        config.cache.routeExpire,
        false
    );

const getTribeSets = (id, limit) =>
    cache.tryGet(
        `500px:tribeSets:${id}`,
        async () => {
            const data = await ofetch(`${baseUrl}/community/tribe/getTribeSetsV2`, {
                headers,
                query: {
                    tribeId: id,
                    privacy: 1,
                    page: 1,
                    size: limit,
                    type: 'json',
                },
            });
            return data.data;
        },
        config.cache.routeExpire,
        false
    );

export { baseUrl, getTribeDetail, getTribeSets };
