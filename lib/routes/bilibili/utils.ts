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
    const x = Math.max(generateGaussianInteger(1245, 5), 0);
    const y = Math.max(generateGaussianInteger(1285, 5), 0);
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

function getDmImgInter() {
    if (config.bilibili.dmImgInter !== undefined) {
        const dmImgInter = JSON.parse(config.bilibili.dmImgInter);
        return JSON.stringify([dmImgInter[Math.floor(Math.random() * dmImgInter.length)]]);
    }
    const p1 = getDmImgInterWh(274, 601);
    const s1 = getDmImgInterOf(134, 30);
    const p2 = getDmImgInterWh(332, 64);
    const s2 = getDmImgInterOf(1101, 338);
    const of = getDmImgInterOf(0, 0);
    const wh = getDmImgInterWh(1245, 1285);
    const ds = [
        {
            t: getDmImgInterT('div'),
            c: getDmImgInterC('clearfix g-search search-container'),
            p: [p1[0], p1[2], p1[1]],
            s: [s1[2], s1[0], s1[1]],
        },
        {
            t: getDmImgInterT('div'),
            c: getDmImgInterC('wrapper'),
            p: [p2[0], p2[2], p2[1]],
            s: [s2[2], s2[0], s2[1]],
        },
    ];
    return JSON.stringify({ ds, wh, of });
}

function getDmImgInterT(tag: string) {
    return {
        a: 4,
        article: 29,
        button: 7,
        div: 2,
        em: 27,
        form: 17,
        h1: 11,
        h2: 12,
        h3: 13,
        h4: 14,
        h5: 15,
        h6: 16,
        img: 5,
        input: 6,
        label: 25,
        li: 10,
        ol: 9,
        option: 20,
        p: 3,
        section: 28,
        select: 19,
        span: 1,
        strong: 26,
        table: 21,
        td: 23,
        textarea: 18,
        th: 24,
        tr: 22,
        ul: 8,
    }[tag];
}

function getDmImgInterC(className: string) {
    return Buffer.from(className).toString('base64').slice(0, -2);
}

function getDmImgInterOf(top: number, left: number) {
    const seed = Math.floor(514 * Math.random());
    return [3 * top + 2 * left + seed, 4 * top - 4 * left + 2 * seed, seed];
}

function getDmImgInterWh(width: number, height: number) {
    const seed = Math.floor(114 * Math.random());
    return [2 * width + 2 * height + 3 * seed, 4 * width - height + seed, seed];
}

function addDmVerifyInfo(params: string, dmImgList: string) {
    const dmImgStr = Buffer.from('no webgl').toString('base64').slice(0, -2);
    const dmCoverImgStr = Buffer.from('no webgl').toString('base64').slice(0, -2);
    return `${params}&dm_img_list=${dmImgList}&dm_img_str=${dmImgStr}&dm_cover_img_str=${dmCoverImgStr}`;
}

function addDmVerifyInfoWithInter(params: string, dmImgList: string, dmImgInter: string) {
    return `${addDmVerifyInfo(params, dmImgList)}&dm_img_inter=${dmImgInter}`;
}

const bvidTime = 1_589_990_400;

/**
 * 获取番剧信息并缓存
 *
 * @param {string} id - 番剧 ID。
 * @param cache - 缓存 module。
 * @returns {Promise<MediaResult>} 番剧信息。
 */
export const getBangumi = (id: string, cache): Promise<MediaResult> =>
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

/**
 * 获取番剧分集信息并缓存
 *
 * @param {string} id - 番剧 ID。
 * @param cache - 缓存 module。
 * @returns {Promise<SeasonResult>} 番剧分集信息。
 */
export const getBangumiItems = (id: string, cache): Promise<SeasonResult> =>
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

/**
 * 使用模板渲染 UGC（用户生成内容）描述。
 *
 * @param {boolean} embed - 是否嵌入视频。
 * @param {string} img - 要包含在描述中的图片 URL。
 * @param {string} description - UGC 的文本描述。
 * @param {string} [aid] - 可选。UGC 的 aid。
 * @param {string} [cid] - 可选。UGC 的 cid。
 * @param {string} [bvid] - 可选。UGC 的 bvid。
 * @returns {string} 渲染的 UGC 描述。
 *
 * @see https://player.bilibili.com/ 获取更多信息。
 */
export const renderUGCDescription = (embed: boolean, img: string, description: string, aid?: string, cid?: string, bvid?: string): string => {
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

/**
 * 使用模板渲染 OGV（原创视频）描述。
 *
 * @param {boolean} embed - 是否嵌入视频。
 * @param {string} img - 要包含在描述中的图片 URL。
 * @param {string} description - OGV 的文本描述。
 * @param {string} [seasonId] - 可选。OGV 的季 ID。
 * @param {string} [episodeId] - 可选。OGV 的集 ID。
 * @returns {string} 渲染的 OGV 描述。
 *
 * @see https://player.bilibili.com/ 获取更多信息。
 */
export const renderOGVDescription = (embed: boolean, img: string, description: string, seasonId?: string, episodeId?: string): string => {
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

export const getVideoUrl = (bvid?: string) => (bvid ? `https://www.bilibili.com/blackboard/newplayer.html?isOutside=true&autoplay=true&danmaku=true&muted=false&highQuality=true&bvid=${bvid}` : undefined);
export const getLiveUrl = (roomId?: string) => (roomId ? `https://www.bilibili.com/blackboard/live/live-activity-player.html?cid=${roomId}` : undefined);

export default {
    lsid,
    _uuid,
    hexsign,
    addWbiVerifyInfo,
    getDmImgList,
    getDmImgInter,
    addDmVerifyInfo,
    addDmVerifyInfoWithInter,
    bvidTime,
    addRenderData,
    getBangumi,
    getBangumiItems,
    renderUGCDescription,
    renderOGVDescription,
    getVideoUrl,
};
