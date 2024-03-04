// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { config } from '@/config';

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

const getUserInfoFromUsername = (username, tryGet) =>
    tryGet(`500px:user:${username}`, async () => {
        const { data } = await got(`${baseUrl}/${username}`);
        const $ = load(data);
        return JSON.parse(
            $('script[type="text/javascript"]')
                .text()
                .match(/var cur_user = new Object\((.*?)\);/)[1]
        );
    });

const getUserInfoFromId = (id, tryGet) =>
    tryGet(`500px:user:indexInfo:${id}`, async () => {
        const { data } = await got(`${baseUrl}/community/v2/user/indexInfo`, {
            headers: {
                ...headers,
            },
            searchParams: {
                queriedUserId: id,
            },
        });
        return data.data;
    });

const getUserWorks = (id, limit, tryGet) =>
    tryGet(
        `500px:user:profile:${id}`,
        async () => {
            const { data } = await got(`${baseUrl}/community/v2/user/profile`, {
                headers: {
                    ...headers,
                },
                searchParams: {
                    resourceType: '0,2,4',
                    imgsize: 'p1,p2,p3,p4',
                    queriedUserId: id,
                    startTime: '',
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

const getTribeDetail = (id, tryGet) =>
    tryGet(
        `500px:tribeDetail:${id}`,
        async () => {
            const { data } = await got(`${baseUrl}/community/tribe/tribeDetail`, {
                headers: {
                    ...headers,
                },
                searchParams: {
                    tribeId: id,
                },
            });
            return data.data;
        },
        config.cache.routeExpire,
        false
    );

const getTribeSets = (id, limit, tryGet) =>
    tryGet(
        `500px:tribeSets:${id}`,
        async () => {
            const { data } = await got(`${baseUrl}/community/tribe/getTribeSetsV2`, {
                headers: {
                    ...headers,
                },
                searchParams: {
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

module.exports = {
    baseUrl,
    getUserInfoFromUsername,
    getUserInfoFromId,
    getUserWorks,
    getTribeDetail,
    getTribeSets,
};
