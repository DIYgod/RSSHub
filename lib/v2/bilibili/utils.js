const config = require('@/config').value;
const md5 = require('@/utils/md5');
const CryptoJS = require('crypto-js');

function iframe(aid, page, bvid) {
    return `<iframe src="https://player.bilibili.com/player.html?${bvid ? `bvid=${bvid}` : `aid=${aid}`}${
        page ? `&page=${page}` : ''
    }&high_quality=1&autoplay=0" width="650" height="477" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>`;
}

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

function addWbiVerifyInfo(params, wbiVerifyString) {
    const searchParams = new URLSearchParams(params);
    searchParams.sort();
    const verifyParam = searchParams.toString();
    const wts = Math.round(Date.now() / 1000);
    const w_rid = md5(`${verifyParam}&wts=${wts}${wbiVerifyString}`);
    return `${params}&w_rid=${w_rid}&wts=${wts}`;
}

function getDmImgList() {
    if (typeof (config.bilibili.dmImgList) === 'undefined') {
        return '[{"x":2721,"y":615,"z":0,"timestamp":29,"type":0}]';    // This is true data from browser
    }
    return config.bilibili.dmImgList;
}

function addDmVerifyInfo(params, dm_img_list) {
    const dm_img_str = Buffer.from('no webgl').toString('base64').slice(0, -2);
    const dm_cover_img_str = Buffer.from('no webgl').toString('base64').slice(0, -2);
    return `${params}&dm_img_list=${dm_img_list}&dm_img_str=${dm_img_str}&dm_cover_img_str=${dm_cover_img_str}`;
}

module.exports = {
    iframe,
    lsid,
    _uuid,
    hexsign,
    addWbiVerifyInfo,
    getDmImgList,
    addDmVerifyInfo,
    bvidTime: 1589990400,
};
