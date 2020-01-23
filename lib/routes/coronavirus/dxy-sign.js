/* eslint-disable */

function e(e, t, n) {
    return (
        t in e
            ? Object.defineProperty(e, t, {
                  value: n,
                  enumerable: !0,
                  configurable: !0,
                  writable: !0,
              })
            : (e[t] = n),
        e
    );
}
function n(t) {
    for (var n = 1; n < arguments.length; n++) {
        var r = null != arguments[n] ? arguments[n] : {},
            o = Object.keys(r);
        'function' === typeof Object.getOwnPropertySymbols &&
            (o = o.concat(
                Object.getOwnPropertySymbols(r).filter(function(e) {
                    return Object.getOwnPropertyDescriptor(r, e).enumerable;
                })
            )),
            o.forEach(function(n) {
                e(t, n, r[n]);
            });
    }
    return t;
}
function r(e, t) {
    return (
        (t = {
            exports: {},
        }),
        e(t, t.exports),
        t.exports
    );
}
var o = r(function(e) {
        (function() {
            var t = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
                n = {
                    rotl: function(e, t) {
                        return (e << t) | (e >>> (32 - t));
                    },
                    rotr: function(e, t) {
                        return (e << (32 - t)) | (e >>> t);
                    },
                    endian: function(e) {
                        if (e.constructor == Number) return (16711935 & n.rotl(e, 8)) | (4278255360 & n.rotl(e, 24));
                        for (var t = 0; t < e.length; t++) e[t] = n.endian(e[t]);
                        return e;
                    },
                    randomBytes: function(e) {
                        for (var t = []; e > 0; e--) t.push(Math.floor(256 * Math.random()));
                        return t;
                    },
                    bytesToWords: function(e) {
                        for (var t = [], n = 0, r = 0; n < e.length; n++, r += 8) t[r >>> 5] |= e[n] << (24 - (r % 32));
                        return t;
                    },
                    wordsToBytes: function(e) {
                        for (var t = [], n = 0; n < 32 * e.length; n += 8) t.push((e[n >>> 5] >>> (24 - (n % 32))) & 255);
                        return t;
                    },
                    bytesToHex: function(e) {
                        for (var t = [], n = 0; n < e.length; n++) t.push((e[n] >>> 4).toString(16)), t.push((15 & e[n]).toString(16));
                        return t.join('');
                    },
                    hexToBytes: function(e) {
                        for (var t = [], n = 0; n < e.length; n += 2) t.push(parseInt(e.substr(n, 2), 16));
                        return t;
                    },
                    bytesToBase64: function(e) {
                        for (var n = [], r = 0; r < e.length; r += 3)
                            for (var o = (e[r] << 16) | (e[r + 1] << 8) | e[r + 2], i = 0; i < 4; i++) 8 * r + 6 * i <= 8 * e.length ? n.push(t.charAt((o >>> (6 * (3 - i))) & 63)) : n.push('=');
                        return n.join('');
                    },
                    base64ToBytes: function(e) {
                        e = e.replace(/[^A-Z0-9+\/]/gi, '');
                        for (var n = [], r = 0, o = 0; r < e.length; o = ++r % 4) 0 != o && n.push(((t.indexOf(e.charAt(r - 1)) & (Math.pow(2, -2 * o + 8) - 1)) << (2 * o)) | (t.indexOf(e.charAt(r)) >>> (6 - 2 * o)));
                        return n;
                    },
                };
            e.exports = n;
        })();
    }),
    i = {
        utf8: {
            stringToBytes: function(e) {
                return i.bin.stringToBytes(unescape(encodeURIComponent(e)));
            },
            bytesToString: function(e) {
                return decodeURIComponent(escape(i.bin.bytesToString(e)));
            },
        },
        bin: {
            stringToBytes: function(e) {
                for (var t = [], n = 0; n < e.length; n++) t.push(255 & e.charCodeAt(n));
                return t;
            },
            bytesToString: function(e) {
                for (var t = [], n = 0; n < e.length; n++) t.push(String.fromCharCode(e[n]));
                return t.join('');
            },
        },
    },
    a = i,
    u = r(function(e) {
        (function() {
            var n = o,
                r = a.utf8,
                i = a.bin,
                u = function(e) {
                    e.constructor == String ? (e = r.stringToBytes(e)) : 'undefined' !== typeof t && 'function' == typeof t.isBuffer && t.isBuffer(e) ? (e = Array.prototype.slice.call(e, 0)) : Array.isArray(e) || (e = e.toString());
                    var o = n.bytesToWords(e),
                        i = 8 * e.length,
                        a = [],
                        u = 1732584193,
                        c = -271733879,
                        l = -1732584194,
                        s = 271733878,
                        f = -1009589776;
                    (o[i >> 5] |= 128 << (24 - (i % 32))), (o[15 + (((i + 64) >>> 9) << 4)] = i);
                    for (var p = 0; p < o.length; p += 16) {
                        for (var d = u, h = c, v = l, y = s, m = f, g = 0; g < 80; g++) {
                            if (g < 16) a[g] = o[p + g];
                            else {
                                var b = a[g - 3] ^ a[g - 8] ^ a[g - 14] ^ a[g - 16];
                                a[g] = (b << 1) | (b >>> 31);
                            }
                            var w =
                                ((u << 5) | (u >>> 27)) +
                                f +
                                (a[g] >>> 0) +
                                (g < 20 ? 1518500249 + ((c & l) | (~c & s)) : g < 40 ? 1859775393 + (c ^ l ^ s) : g < 60 ? ((c & l) | (c & s) | (l & s)) - 1894007588 : (c ^ l ^ s) - 899497514);
                            (f = s), (s = l), (l = (c << 30) | (c >>> 2)), (c = u), (u = w);
                        }
                        (u += d), (c += h), (l += v), (s += y), (f += m);
                    }
                    return [u, c, l, s, f];
                },
                c = function(e, t) {
                    var r = n.wordsToBytes(u(e));
                    return t && t.asBytes ? r : t && t.asString ? i.bytesToString(r) : n.bytesToHex(r);
                };
            (c._blocksize = 16), (c._digestsize = 20), (e.exports = c);
        })();
    });
function c() {
    for (
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 8,
            t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 'alphabet',
            n = '',
            r = {
                alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
                number: '0123456789',
            }[t],
            o = 0;
        o < e;
        o++
    )
        n += r.charAt(Math.floor(Math.random() * r.length));
    return n;
}

module.exports = u;
