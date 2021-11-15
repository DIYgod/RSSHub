const iframe = (aid, page, bvid) =>
    `<iframe src="https://player.bilibili.com/player.html?${bvid ? `bvid=${bvid}` : `aid=${aid}`}${
        page ? `&page=${page}` : ''
    }&high_quality=1" width="650" height="477" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>`;

export default {
    iframe,
    bvidTime: 1_589_990_400,
};
