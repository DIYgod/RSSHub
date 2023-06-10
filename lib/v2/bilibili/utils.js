const md5 = require('@/utils/md5');

function iframe(aid, page, bvid) {
    return `<iframe src="https://player.bilibili.com/player.html?${bvid ? `bvid=${bvid}` : `aid=${aid}`}${
        page ? `&page=${page}` : ''
    }&high_quality=1&autoplay=0" width="650" height="477" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>`;
}

const addVerifyInfo = (params, verifyString) => {
    const verifyParam = params.split('&').sort().join('&');
    const wts = Math.round(Date.now() / 1000);
    const w_rid = md5(`${verifyParam}&wts=${wts}${verifyString}`);
    return `${params}&w_rid=${w_rid}&wts=${wts}`;
};

module.exports = {
    iframe,
    addVerifyInfo,
    bvidTime: 1589990400,
};
