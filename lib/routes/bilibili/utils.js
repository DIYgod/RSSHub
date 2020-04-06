const iframe = (aid, page) =>
    `<iframe src="https://player.bilibili.com/player.html?aid=${aid}${page ? `&page=${page}` : ''}" width="650" height="477" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>`;

const table = 'fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF';
const tr = {};
for (let i = 0; i < 58; ++i) {
    tr[table[i]] = i;
}

const s = [11, 10, 3, 8, 4, 6];
const xor = 177451812;
const add = 8728348608;

function bidToAid(bid) {
    let r = 0;
    for (let i = 0; i < 6; ++i) {
        r += tr[bid[s[i]]] * 58 ** i;
    }
    return String((r - add) ^ xor);
}

module.exports = {
    iframe,
    bidToAid,
};
