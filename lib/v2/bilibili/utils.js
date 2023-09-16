const md5 = require('@/utils/md5');
const got = require('@/utils/got');

function iframe(aid, page, bvid) {
    return `<iframe src="https://player.bilibili.com/player.html?${bvid ? `bvid=${bvid}` : `aid=${aid}`}${
        page ? `&page=${page}` : ''
    }&high_quality=1&autoplay=0" width="650" height="477" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>`;
}

function addVerifyInfo(params, verifyString) {
    const verifyParam = params.split('&').sort().join('&');
    const wts = Math.round(Date.now() / 1000);
    const w_rid = md5(`${verifyParam}&wts=${wts}${verifyString}`);
    return `${params}&w_rid=${w_rid}&wts=${wts}`;
}

async function getCookie() {
    // default Referer: https://www.bilibili.com is limited
    // Bilibili return cookies with multiple set-cookie
    const url = 'https://www.bilibili.com/';
    const response = await got(url);
    const setCookies = response.headers['set-cookie'];
    if (typeof setCookies === 'undefined') {
        return '';
    }
    return setCookies.map((cookie) => cookie.split(';')[0]).join('; ');
}

module.exports = {
    iframe,
    addVerifyInfo,
    getCookie,
    bvidTime: 1589990400,
};
