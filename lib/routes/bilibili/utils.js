const iframe = (aid, page) =>
    `<iframe src="https://player.bilibili.com/player.html?aid=${aid}${page ? `&page=${page}` : ''}" width="650" height="477" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>`;

module.exports = {
    iframe,
};
