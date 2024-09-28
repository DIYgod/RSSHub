import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { config } from '@/config';
import md5 from '@/utils/md5';
import ofetch from '@/utils/ofetch';
import { art } from '@/utils/render';
import CryptoJS from 'crypto-js';
import path from 'node:path';
import { MediaResult, ResultResponse, SeasonResult } from './types';

// a
function randomHexStr(length) {
    let string = '';
    for (let r = 0; r < length; r++) {
        string += dec2HexUpper(16 * Math.random());
    }
    return padStringWithZeros(string, length);
}

// o
function dec2HexUpper(e) {
    return Math.ceil(e).toString(16).toUpperCase();
}

// s
function padStringWithZeros(string, length) {
    let padding = '';
    if (string.length < length) {
        for (let n = 0; n < length - string.length; n++) {
            padding += '0';
        }
    }
    return padding + string;
}

function lsid() {
    const e = Date.now().toString(16).toUpperCase();
    const lsid = randomHexStr(8) + '_' + e;
    return lsid;
}

function _uuid() {
    const e = randomHexStr(8);
    const t = randomHexStr(4);
    const r = randomHexStr(4);
    const n = randomHexStr(4);
    const o = randomHexStr(12);
    const i = Date.now();
    return e + '-' + t + '-' + r + '-' + n + '-' + o + padStringWithZeros((i % 100000).toString(), 5) + 'infoc';
}

// P
function shiftCharByOne(string) {
    let shiftedStr = '';
    for (let n = 0; n < string.length; n++) {
        shiftedStr += String.fromCharCode(string.charCodeAt(n) - 1);
    }
    return shiftedStr;
}

// o
function hexsign(e) {
    const n = 'YhxToH[2q';
    const r = CryptoJS.HmacSHA256('ts'.concat(e), shiftCharByOne(n));
    const o = CryptoJS.enc.Hex.stringify(r);
    return o;
}

function addRenderData(params, renderData) {
    return `${params}&w_webid=${encodeURIComponent(renderData)}`;
}

function addWbiVerifyInfo(params, wbiVerifyString) {
    const searchParams = new URLSearchParams(params);
    searchParams.sort();
    const verifyParam = searchParams.toString();
    const wts = Math.round(Date.now() / 1000);
    const w_rid = md5(`${verifyParam}&wts=${wts}${wbiVerifyString}`);
    return `${params}&w_rid=${w_rid}&wts=${wts}`;
}

// https://github.com/errcw/gaussian/blob/master/lib/box-muller.js
function generateGaussianInteger(mean, std) {
    const _2PI = Math.PI * 2;
    const u1 = Math.random();
    const u2 = Math.random();

    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(_2PI * u2);

    return Math.round(z0 * std + mean);
}

function getDmImgList() {
    if (config.bilibili.dmImgList !== undefined) {
        const dmImgList = JSON.parse(config.bilibili.dmImgList);
        return JSON.stringify([dmImgList[Math.floor(Math.random() * dmImgList.length)]]);
    }
    const x = Math.max(generateGaussianInteger(650, 5), 0);
    const y = Math.max(generateGaussianInteger(400, 5), 0);
    const path = [
        {
            x: 3 * x + 2 * y,
            y: 4 * x - 5 * y,
            z: 0,
            timestamp: Math.max(generateGaussianInteger(30, 5), 0),
            type: 0,
        },
    ];
    return JSON.stringify(path);
}

function addDmVerifyInfo(params, dmImgList) {
    const dmImgStr = Buffer.from('no webgl').toString('base64').slice(0, -2);
    const dmCoverImgStr = Buffer.from('no webgl').toString('base64').slice(0, -2);
    return `${params}&dm_img_list=${dmImgList}&dm_img_str=${dmImgStr}&dm_cover_img_str=${dmCoverImgStr}`;
}

const bvidTime = 1_589_990_400;

export const getBangumi = (id: string, cache) =>
    cache.tryGet(
        `bilibili:getBangumi:${id}`,
        async () => {
            const res = await ofetch<ResultResponse<MediaResult>>('https://api.bilibili.com/pgc/view/web/media', {
                query: {
                    media_id: id,
                },
            });
            if (res.result.share_url === undefined) {
                // reference: https://api.bilibili.com/pgc/review/user?media_id=${id}
                res.result.share_url = `https://www.bilibili.com/bangumi/media/md${res.result.media_id}`;
            }
            return res.result;
        },
        config.cache.routeExpire,
        false
    ) as Promise<MediaResult>;

export const getBangumiItems = (id: string, cache) =>
    cache.tryGet(
        `bilibili:getBangumiItems:${id}`,
        async () => {
            const res = await ofetch<ResultResponse<SeasonResult>>('https://api.bilibili.com/pgc/web/season/section', {
                query: {
                    season_id: id,
                },
            });
            return res.result;
        },
        config.cache.routeExpire,
        false
    ) as Promise<SeasonResult>;

export const renderUGCDescription = (embed: boolean, img: string, description: string, aid?: string, cid?: string, bvid?: string) => {
    // docs: https://player.bilibili.com/
    const rendered = art(path.join(__dirname, 'templates/description.art'), {
        embed,
        ugc: true,
        aid,
        cid,
        bvid,
        img: img.replace('http://', 'https://'),
        description,
    });
    return rendered;
};

export const renderOGVDescription = (embed: boolean, img: string, description: string, seasonId?: string, episodeId?: string) => {
    // docs: https://player.bilibili.com/
    const rendered = art(path.join(__dirname, 'templates/description.art'), {
        embed,
        ogv: true,
        seasonId,
        episodeId,
        img: img.replace('http://', 'https://'),
        description,
    });
    return rendered;
};

export default {
    lsid,
    _uuid,
    hexsign,
    addWbiVerifyInfo,
    getDmImgList,
    addDmVerifyInfo,
    bvidTime,
    addRenderData,
    getBangumi,
    getBangumiItems,
    renderUGCDescription,
    renderOGVDescription,
};
