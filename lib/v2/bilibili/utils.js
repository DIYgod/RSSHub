const iframe = (aid, page, bvid) =>
    `<iframe src="https://player.bilibili.com/player.html?${bvid ? `bvid=${bvid}` : `aid=${aid}`}${
        page ? `&page=${page}` : ''
    }&high_quality=1" width="650" height="477" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>`;

const addVerifyInfo = (t, f) => {
    const r = (t, e) => (t(e = {
            exports: {
            }
        }, e.exports),
            e.exports);
    const o = r(((t) => {
        !function () {
            const e = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
            n = {
                rotl (t, e) {
                    return t << e | t >>> 32 - e;
                },
                rotr (t, e) {
                    return t << 32 - e | t >>> e;
                },
                endian (t) {
                    if (t.constructor === Number) {return 16711935 & n.rotl(t, 8) | 4278255360 & n.rotl(t, 24);}
                    for (let e = 0; e < t.length; e++) {t[e] = n.endian(t[e]);}
                    return t;
                },
                randomBytes (t) {
                    let e;
                    for (e = [
                    ]; t > 0; t--) {e.push(Math.floor(256 * Math.random()));}
                    return e;
                },
                bytesToWords (t) {
                    let e, n, r;
                    for (e = [
                    ], n = 0, r = 0; n < t.length; n++, r += 8) {e[r >>> 5] |= t[n] << 24 - r % 32;}
                    return e;
                },
                wordsToBytes (t) {
                    let e, n;
                    for (e = [
                    ], n = 0; n < 32 * t.length; n += 8) {e.push(t[n >>> 5] >>> 24 - n % 32 & 255);}
                    return e;
                },
                bytesToHex (t) {
                    let e, n;
                    for (e = [
                    ], n = 0; n < t.length; n++) {e.push((t[n] >>> 4).toString(16)),
                        e.push((15 & t[n]).toString(16));}
                    return e.join('');
                },
                hexToBytes (t) {
                    let e, n;
                    for (e = [
                    ], n = 0; n < t.length; n += 2) {e.push(parseInt(t.substr(n, 2), 16));}
                    return e;
                },
                bytesToBase64 (t) {
                    let n, r;
                    for (n = [
                    ], r = 0; r < t.length; r += 3) {for (let o = t[r] << 16 | t[r + 1] << 8 | t[r + 2], i = 0; i < 4; i++) {8 * r + 6 * i <= 8 * t.length ? n.push(e.charAt(o >>> 6 * (3 - i) & 63)) : n.push('=');}}
                    return n.join('');
                },
                base64ToBytes (t) {
                    t = t.replace(/[^A-Z0-9+/]/gi, '');
                    let n, r, o;
                    for (n = [
                    ], r = 0, o = 0; r < t.length; o = ++r % 4) {0 !== o && n.push((e.indexOf(t.charAt(r - 1)) & Math.pow(2, -2 * o + 8) - 1) << 2 * o | e.indexOf(t.charAt(r)) >>> 6 - 2 * o);}
                    return n;
                }
            };
            t.exports = n;
        }();
    }));
    const i = {
        utf8: {
            stringToBytes (t) {
                return i.bin.stringToBytes(unescape(encodeURIComponent(t)));
            },
            bytesToString (t) {
                return decodeURIComponent(escape(i.bin.bytesToString(t)));
            }
        },
        bin: {
            stringToBytes (t) {
                let e, n;
                for (e = [
                ], n = 0; n < t.length; n++) {e.push(255 & t.charCodeAt(n));}
                return e;
            },
            bytesToString (t) {
                let e, n;
                for (e = [
                ], n = 0; n < t.length; n++) {e.push(String.fromCharCode(t[n]));}
                return e.join('');
            }
        }
    };
    const a = i;
    const s = (t) => null !== t && (c(t) || function (t) {
            return 'function' === typeof t.readFloatLE && 'function' === typeof t.slice && c(t.slice(0, 0));
        }(t) || !!t._isBuffer);
    const c = (t) => !!t.constructor && 'function' === typeof t.constructor.isBuffer && t.constructor.isBuffer(t);
    const u = r(((t) => {
        !function () {
            const e = o,
                n = a.utf8,
                r = s,
                i = a.bin,
                c = function (t, o) {
                    t.constructor === String ? t = o && 'binary' === o.encoding ? i.stringToBytes(t) : n.stringToBytes(t) : r(t) ? t = Array.prototype.slice.call(t, 0) : Array.isArray(t) || t.constructor === Uint8Array || (t = t.toString());
                    let a, s, u, l, f, p, d;
                    for (a = e.bytesToWords(t), s = 8 * t.length, u = 1732584193, l = -271733879, f = -1732584194, p = 271733878, d = 0; d < a.length; d++) {a[d] = 16711935 & (a[d] << 8 | a[d] >>> 24) | 4278255360 & (a[d] << 24 | a[d] >>> 8);}
                    a[s >>> 5] |= 128 << s % 32,
                        a[14 + (s + 64 >>> 9 << 4)] = s;
                    const h = c._ff,
                        v = c._gg,
                        y = c._hh,
                        m = c._ii;
                    for (d = 0; d < a.length; d += 16) {
                        const g = u,
                            b = l,
                            w = f,
                            x = p;
                        u = h(u, l, f, p, a[d + 0], 7, -680876936),
                            p = h(p, u, l, f, a[d + 1], 12, -389564586),
                            f = h(f, p, u, l, a[d + 2], 17, 606105819),
                            l = h(l, f, p, u, a[d + 3], 22, -1044525330),
                            u = h(u, l, f, p, a[d + 4], 7, -176418897),
                            p = h(p, u, l, f, a[d + 5], 12, 1200080426),
                            f = h(f, p, u, l, a[d + 6], 17, -1473231341),
                            l = h(l, f, p, u, a[d + 7], 22, -45705983),
                            u = h(u, l, f, p, a[d + 8], 7, 1770035416),
                            p = h(p, u, l, f, a[d + 9], 12, -1958414417),
                            f = h(f, p, u, l, a[d + 10], 17, -42063),
                            l = h(l, f, p, u, a[d + 11], 22, -1990404162),
                            u = h(u, l, f, p, a[d + 12], 7, 1804603682),
                            p = h(p, u, l, f, a[d + 13], 12, -40341101),
                            f = h(f, p, u, l, a[d + 14], 17, -1502002290),
                            u = v(u, l = h(l, f, p, u, a[d + 15], 22, 1236535329), f, p, a[d + 1], 5, -165796510),
                            p = v(p, u, l, f, a[d + 6], 9, -1069501632),
                            f = v(f, p, u, l, a[d + 11], 14, 643717713),
                            l = v(l, f, p, u, a[d + 0], 20, -373897302),
                            u = v(u, l, f, p, a[d + 5], 5, -701558691),
                            p = v(p, u, l, f, a[d + 10], 9, 38016083),
                            f = v(f, p, u, l, a[d + 15], 14, -660478335),
                            l = v(l, f, p, u, a[d + 4], 20, -405537848),
                            u = v(u, l, f, p, a[d + 9], 5, 568446438),
                            p = v(p, u, l, f, a[d + 14], 9, -1019803690),
                            f = v(f, p, u, l, a[d + 3], 14, -187363961),
                            l = v(l, f, p, u, a[d + 8], 20, 1163531501),
                            u = v(u, l, f, p, a[d + 13], 5, -1444681467),
                            p = v(p, u, l, f, a[d + 2], 9, -51403784),
                            f = v(f, p, u, l, a[d + 7], 14, 1735328473),
                            u = y(u, l = v(l, f, p, u, a[d + 12], 20, -1926607734), f, p, a[d + 5], 4, -378558),
                            p = y(p, u, l, f, a[d + 8], 11, -2022574463),
                            f = y(f, p, u, l, a[d + 11], 16, 1839030562),
                            l = y(l, f, p, u, a[d + 14], 23, -35309556),
                            u = y(u, l, f, p, a[d + 1], 4, -1530992060),
                            p = y(p, u, l, f, a[d + 4], 11, 1272893353),
                            f = y(f, p, u, l, a[d + 7], 16, -155497632),
                            l = y(l, f, p, u, a[d + 10], 23, -1094730640),
                            u = y(u, l, f, p, a[d + 13], 4, 681279174),
                            p = y(p, u, l, f, a[d + 0], 11, -358537222),
                            f = y(f, p, u, l, a[d + 3], 16, -722521979),
                            l = y(l, f, p, u, a[d + 6], 23, 76029189),
                            u = y(u, l, f, p, a[d + 9], 4, -640364487),
                            p = y(p, u, l, f, a[d + 12], 11, -421815835),
                            f = y(f, p, u, l, a[d + 15], 16, 530742520),
                            u = m(u, l = y(l, f, p, u, a[d + 2], 23, -995338651), f, p, a[d + 0], 6, -198630844),
                            p = m(p, u, l, f, a[d + 7], 10, 1126891415),
                            f = m(f, p, u, l, a[d + 14], 15, -1416354905),
                            l = m(l, f, p, u, a[d + 5], 21, -57434055),
                            u = m(u, l, f, p, a[d + 12], 6, 1700485571),
                            p = m(p, u, l, f, a[d + 3], 10, -1894986606),
                            f = m(f, p, u, l, a[d + 10], 15, -1051523),
                            l = m(l, f, p, u, a[d + 1], 21, -2054922799),
                            u = m(u, l, f, p, a[d + 8], 6, 1873313359),
                            p = m(p, u, l, f, a[d + 15], 10, -30611744),
                            f = m(f, p, u, l, a[d + 6], 15, -1560198380),
                            l = m(l, f, p, u, a[d + 13], 21, 1309151649),
                            u = m(u, l, f, p, a[d + 4], 6, -145523070),
                            p = m(p, u, l, f, a[d + 11], 10, -1120210379),
                            f = m(f, p, u, l, a[d + 2], 15, 718787259),
                            l = m(l, f, p, u, a[d + 9], 21, -343485551),
                            u = u + g >>> 0,
                            l = l + b >>> 0,
                            f = f + w >>> 0,
                            p = p + x >>> 0;
                    }
                    return e.endian([u,
                        l,
                        f,
                        p]);
                };
            c._ff = function (t, e, n, r, o, i, a) {
                const s = t + (e & n | ~e & r) + (o >>> 0) + a;
                return (s << i | s >>> 32 - i) + e;
            },
                c._gg = function (t, e, n, r, o, i, a) {
                    const s = t + (e & r | n & ~r) + (o >>> 0) + a;
                    return (s << i | s >>> 32 - i) + e;
                },
                c._hh = function (t, e, n, r, o, i, a) {
                    const s = t + (e ^ n ^ r) + (o >>> 0) + a;
                    return (s << i | s >>> 32 - i) + e;
                },
                c._ii = function (t, e, n, r, o, i, a) {
                    const s = t + (n ^ (e | ~r)) + (o >>> 0) + a;
                    return (s << i | s >>> 32 - i) + e;
                },
                c._blocksize = 16,
                c._digestsize = 16,
                t.exports = function (t, n) {
                    if (null === t) {throw new Error('Illegal argument ' + t);}
                    const r = e.wordsToBytes(c(t, n));
                    return n && n.asBytes ? r : n && n.asString ? i.bytesToString(r) : e.bytesToHex(r);
                };
        }();
    }));
    const ea = function (b, f) {
        const p = Math.round(Date.now() / 1000);
        return {
            w_rid: u(`${b}&wts=${p}${f}`),
            wts: p.toString()
        };
    };
    const info = ea(t, f);
    return `${t}&w_rid=${info.w_rid}&wts=${info.wts}`;
};

module.exports = {
    iframe,
    addVerifyInfo,
    bvidTime: 1589990400,
};
