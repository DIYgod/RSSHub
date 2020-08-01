const iframe = (aid, page, bvid) =>
    `<iframe src="https://player.bilibili.com/player.html?${bvid ? `bvid=${bvid}` : `aid=${aid}`}${
        page ? `&page=${page}` : ''
    }" width="650" height="477" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>`;

module.exports = {
    iframe,
    bvidTime: 1589990400,
};
