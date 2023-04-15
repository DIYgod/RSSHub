const crypto = require('crypto');

function iframe(aid, page, bvid) {
    return `<iframe src="https://player.bilibili.com/player.html?${bvid ? `bvid=${bvid}` : `aid=${aid}`}${
        page ? `&page=${page}` : ''
    }&high_quality=1&autoplay=0" width="650" height="477" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>`;
}

const addVerifyInfo = (params, verifyString) => {
    const md5 = crypto.createHash('md5');
    const wts = Math.round(Date.now() / 1000);
    const w_rid = md5.update(`${params}&wts=${wts}${verifyString}`).digest('hex');
    return `${params}&w_rid=${w_rid}&wts=${wts}`;
};

module.exports = {
    iframe,
    addVerifyInfo,
    bvidTime: 1589990400,
};
