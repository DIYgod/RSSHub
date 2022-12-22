const iframe = (aid, page, bvid) =>
    `<iframe src="https://player.bilibili.com/player.html?${bvid ? `bvid=${bvid}` : `aid=${aid}`}${
        page ? `&page=${page}` : ''
    }&high_quality=1" width="650" height="477" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>`;

const addVerifyInfo = (t, f) => {
    const crypto = require('crypto');
    const md5 = crypto.createHash('md5');
    const wts = Math.round(Date.now() / 1000);
    const w_rid = md5.update(`${t}&wts=${wts}${f}`)
    return `${t}&w_rid=${w_rid}&wts=${wts}`;
};

module.exports = {
    iframe,
    addVerifyInfo,
    bvidTime: 1589990400,
};
