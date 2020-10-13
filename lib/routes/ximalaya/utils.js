const crypto = require('crypto');
const getParams = (ep) => {
    const a1 = 'xkt3a41psizxrh9l';
    const a = [
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        62,
        -1,
        -1,
        -1,
        63,
        52,
        53,
        54,
        55,
        56,
        57,
        58,
        59,
        60,
        61,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        26,
        27,
        28,
        29,
        30,
        31,
        32,
        33,
        34,
        35,
        36,
        37,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        46,
        47,
        48,
        49,
        50,
        51,
        -1,
        -1,
        -1,
        -1,
        -1,
    ];
    let o = ep.length;
    let r = 0;
    let n, e;
    const a2 = [];
    while (r < o) {
        e = a[255 & ep[r].charCodeAt()];
        r += 1;
        while (r < o && -1 === e) {
            e = a[255 & ep[r].charCodeAt()];
            r += 1;
        }

        if (-1 === e) {
            break;
        }
        n = a[255 & ep[r].charCodeAt()];
        r += 1;
        while (r < o && -1 === n) {
            n = a[255 & ep[r].charCodeAt()];
            r += 1;
        }
        if (-1 === n) {
            break;
        }
        a2.push((e << 2) | ((48 & n) >> 4));
        e = 255 & ep[r].charCodeAt();
        r += 1;
        if (61 === e) {
            break;
        }
        e = a[e];
        while (r < o && -1 === e) {
            e = 255 & ep[r].charCodeAt();
            if (61 === e) {
                break;
            }
            e = a[e];
        }
        if (-1 === e) {
            break;
        }
        a2.push(((15 & n) << 4) | ((60 & e) >> 2));
        n = 255 & ep[r].charCodeAt();
        r += 1;
        if (61 === n) {
            break;
        }
        n = a[n];
        while (r < o && -1 === n) {
            n = 255 & ep[r].charCodeAt();
            if (61 === n) {
                break;
            }
            n = a[n];
        }
        if (-1 === n) {
            break;
        }
        a2.push(((3 & e) << 6) | n);
    }

    const r1 = Array.from(Array(256), (v, i) => i);

    let i = '';
    o = 0;
    for (let a = 0; a < 256; a++) {
        o = (o + r1[a] + a1[a % a1.length].charCodeAt()) % 256;
        [r1[a], r1[o]] = [r1[o], r1[a]];
    }

    let a3 = 0;
    o = 0;
    for (let u = 0; u < a2.length; u++) {
        a3 = (a3 + 1) % 256;
        o = (o + r1[a3]) % 256;
        [r1[a3], r1[o]] = [r1[o], r1[a3]];
        i += String.fromCharCode(a2[u] ^ r1[(r1[a3] + r1[o]) % 256]);
    }
    i = i.split('-');
    return {
        sign: i[1],
        buy_key: i[0],
        token: i[2],
        timestamp: i[3],
    };
};

const getPath = (seed, fileId) => {
    let t = String.raw`abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ/\:._-1234567890`;
    let cgStr = '';
    const l = t.length;
    let o;
    const idKey = fileId.split('*');
    for (let i = 0; i < l; i++) {
        seed = (211 * seed + 30031) % 65536;
        o = parseInt((seed * t.length) / 65536);
        cgStr += t[o];
        t = t.split(t[o]).join('');
    }

    const url = idKey.map((id) => cgStr[id]).join('');
    return url;
};

const getUrl = (r) => {
    const params = getParams(r.ep);
    const paramsArray = [];
    params.duration = r.duration;
    Object.keys(params).forEach((key) => params[key] && paramsArray.push(`${key}=${params[key]}`));
    const url = 'https://audiopay.cos.xmcdn.com/download/' + r.apiVersion + '/' + getPath(r.seed, r.fileId) + '?' + paramsArray.join('&');
    return url;
};

const getRandom16 = (len) =>
    crypto
        .randomBytes(Math.ceil(len / 2))
        .toString('hex')
        .slice(0, len);

module.exports = {
    getUrl,
    getRandom16,
};
