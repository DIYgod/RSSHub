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

function addVerifyInfo(params, verifyString) {
    const searchParams = new URLSearchParams(params);
    searchParams.sort();
    const verifyParam = searchParams.toString();
    const wts = Math.round(Date.now() / 1000);
    const w_rid = md5(`${verifyParam}&wts=${wts}${verifyString}`);
    return `${params}&w_rid=${w_rid}&wts=${wts}`;
}

module.exports = {
    iframe,
    lsid,
    _uuid,
    hexsign,
    addVerifyInfo,
    bvidTime: 1589990400,
};
