/* eslint-disable unicorn/prefer-spread */
/* eslint-disable unicorn/prefer-math-trunc */
// @ts-nocheck

// Credits:
// https://github.com/NearHuiwen/TiktokDouyinCrawler/blob/main/utils/a_bogus.js
// https://github.com/110Art/a-bogus/blob/main/a_bogus.js
// https://github.com/ShilongLee/Crawler/blob/main/lib/js/douyin.js

// Reference:
// https://github.com/Endy-c/gm-crypt/blob/87bfc13f4b234c538d56798ed2457da16bc006ac/src/sm3.js

import logger from '@/utils/logger';

function rc4_encrypt(plaintext, key) {
    const s: number[] = [];
    for (let i = 0; i < 256; i++) {
        s[i] = i;
    }
    for (let i = 0, j = 0; i < 256; i++) {
        j = (j + s[i] + key.codePointAt(i % key.length)) % 256;
        const temp = s[i];
        s[i] = s[j];
        s[j] = temp;
    }

    const cipher: string[] = [];
    for (let i = 0, j = 0, k = 0; k < plaintext.length; k++) {
        i = (i + 1) % 256;
        j = (j + s[i]) % 256;
        const temp = s[i];
        s[i] = s[j];
        s[j] = temp;
        const t = (s[i] + s[j]) % 256;
        cipher.push(String.fromCodePoint(s[t] ^ plaintext.codePointAt(k)));
    }
    return cipher.join('');
}

function rotateLeft32(e, r) {
    return ((e << (r %= 32)) | (e >>> (32 - r))) >>> 0;
}

function T(j) {
    if (0 <= j && j < 16) {
        return 0x79_CC_45_19;
    } else if (16 <= j && j < 64) {
        return 0x7A_87_9D_8A;
    } else {
        logger.error('invalid j for constant Tj');
    }
}

function FF(j, x, y, z) {
    if (0 <= j && j < 16) {
        return (x ^ y ^ z) >>> 0;
    } else if (16 <= j && j < 64) {
        return ((x & y) | (x & z) | (y & z)) >>> 0;
    } else {
        logger.error('invalid j for bool function FF');
        return 0;
    }
}

function GG(j, x, y, z) {
    if (0 <= j && j < 16) {
        return (x ^ y ^ z) >>> 0;
    } else if (16 <= j && j < 64) {
        return ((x & y) | (~x & z)) >>> 0;
    } else {
        logger.error('invalid j for bool function GG');
        return 0;
    }
}

function reset(this: any) {
    this.reg[0] = 0x73_80_16_6F;
    this.reg[1] = 0x49_14_B2_B9;
    this.reg[2] = 0x17_24_42_D7;
    this.reg[3] = 0xDA_8A_06_00;
    this.reg[4] = 0xA9_6F_30_BC;
    this.reg[5] = 0x16_31_38_AA;
    this.reg[6] = 0xE3_8D_EE_4D;
    this.reg[7] = 0xB0_FB_0E_4E;
    this.chunk = [];
    this.size = 0;
}

function strToBytes(str) {
    const n = encodeURIComponent(str).replaceAll(/%([0-9A-F]{2})/g, (e, r) => String.fromCodePoint('0x' + r));
    const a = Array.from({ length: n.length });
    Array.prototype.forEach.call(n, (e, r) => {
        a[r] = e.codePointAt(0);
    });
    return a;
}

function write(this: any, message) {
    const a = typeof message === 'string' ? strToBytes(message) : message;
    this.size += a.length;
    let f = 64 - this.chunk.length;
    if (a.length < f) {
        this.chunk = this.chunk.concat(a);
    } else {
        this.chunk = this.chunk.concat(a.slice(0, f));
        while (this.chunk.length >= 64) {
            this._compress(this.chunk);
            this.chunk = f < a.length ? a.slice(f, Math.min(f + 64, a.length)) : [];
            f += 64;
        }
    }
}

function sum(this: any, message, encoding) {
    if (message) {
        this.reset();
        this.write(message);
    }
    this._fill();
    for (let f = 0; f < this.chunk.length; f += 64) {
        this._compress(this.chunk.slice(f, f + 64));
    }
    let digest;
    if (encoding === 'hex') {
        digest = '';
        for (let f = 0; f < 8; f++) {
            digest += se(this.reg[f].toString(16), 8, '0');
        }
    } else {
        digest = Array.from({ length: 32 });
        for (let f = 0; f < 8; f++) {
            let c = this.reg[f];
            digest[4 * f + 3] = (255 & c) >>> 0;
            c >>>= 8;
            digest[4 * f + 2] = (255 & c) >>> 0;
            c >>>= 8;
            digest[4 * f + 1] = (255 & c) >>> 0;
            c >>>= 8;
            digest[4 * f] = (255 & c) >>> 0;
        }
    }
    this.reset();
    return digest;
}

function expand(e) {
    const r: number[] = Array.from({ length: 132 });
    for (let t = 0; t < 16; t++) {
        r[t] = e[4 * t] << 24;
        r[t] |= e[4 * t + 1] << 16;
        r[t] |= e[4 * t + 2] << 8;
        r[t] |= e[4 * t + 3];
        r[t] >>>= 0;
    }
    for (let n = 16; n < 68; n++) {
        let a = r[n - 16] ^ r[n - 9] ^ rotateLeft32(r[n - 3], 15);
        a = a ^ rotateLeft32(a, 15) ^ rotateLeft32(a, 23);
        r[n] = (a ^ rotateLeft32(r[n - 13], 7) ^ r[n - 6]) >>> 0;
    }
    for (let n = 0; n < 64; n++) {
        r[n + 68] = (r[n] ^ r[n + 4]) >>> 0;
    }
    return r;
}

function _compress(this: any, t) {
    if (t < 64) {
        logger.error('compress error: not enough data');
        return;
    } else {
        const f = expand(t);
        const i = this.reg.slice(0);
        for (let c = 0; c < 64; c++) {
            let o = rotateLeft32(i[0], 12) + i[4] + rotateLeft32(T(c), c);
            o = (0xFF_FF_FF_FF & o) >>> 0;
            o = rotateLeft32(o, 7);

            const s = (o ^ rotateLeft32(i[0], 12)) >>> 0;
            let u = FF(c, i[0], i[1], i[2]);
            u = u + i[3] + s + f[c + 68];
            u = (0xFF_FF_FF_FF & u) >>> 0;

            let b = GG(c, i[4], i[5], i[6]);
            b = b + i[7] + o + f[c];
            b = (0xFF_FF_FF_FF & b) >>> 0;
            i[3] = i[2];
            i[2] = rotateLeft32(i[1], 9);
            i[1] = i[0];
            i[0] = u;
            i[7] = i[6];
            i[6] = rotateLeft32(i[5], 19);
            i[5] = i[4];
            i[4] = (b ^ rotateLeft32(b, 9) ^ rotateLeft32(b, 17)) >>> 0;
        }
        for (let l = 0; l < 8; l++) {
            this.reg[l] = (this.reg[l] ^ i[l]) >>> 0;
        }
    }
}

function _fill(this: any) {
    const a = 8 * this.size;
    let f = this.chunk.push(128) % 64;
    for (64 - f < 8 && (f -= 64); f < 56; f++) {
        this.chunk.push(0);
    }
    for (let i = 0; i < 4; i++) {
        const c = Math.floor(a / 0x1_00_00_00_00);
        this.chunk.push((c >>> (8 * (3 - i))) & 0xFF);
    }
    for (let i = 0; i < 4; i++) {
        this.chunk.push((a >>> (8 * (3 - i))) & 0xFF);
    }
}

function SM3(this: any) {
    this.reg = [];
    this.chunk = [];
    this.size = 0;
    this.reset();
}
SM3.prototype.reset = reset;
SM3.prototype.write = write;
SM3.prototype.sum = sum;
SM3.prototype._compress = _compress;
SM3.prototype._fill = _fill;

function result_encrypt(long_str: string, num: 's0' | 's1' | 's2' | 's3' | 's4') {
    const s_obj = {
        s0: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
        s1: 'Dkdpgh4ZKsQB80/Mfvw36XI1R25+WUAlEi7NLboqYTOPuzmFjJnryx9HVGcaStCe=',
        s2: 'Dkdpgh4ZKsQB80/Mfvw36XI1R25-WUAlEi7NLboqYTOPuzmFjJnryx9HVGcaStCe=',
        s3: 'ckdp1h4ZKsUB80/Mfvw36XIgR25+WQAlEi7NLboqYTOPuzmFjJnryx9HVGDaStCe',
        s4: 'Dkdpgh2ZmsQB80/MfvV36XI1R45-WUAlEixNLwoqYTOPuzKFjJnry79HbGcaStCe',
    };
    const constant = {
        '0': 16_515_072,
        '1': 258048,
        '2': 4032,
        str: s_obj[num],
    };

    let result = '';
    let lound = 0;
    let long_int = get_long_int(lound, long_str);
    for (let i = 0; i < (long_str.length / 3) * 4; i++) {
        if (Math.floor(i / 4) !== lound) {
            lound += 1;
            long_int = get_long_int(lound, long_str);
        }
        const key = i % 4;
        let temp_int: number;
        switch (key) {
            case 0:
                temp_int = (long_int & constant['0']) >> 18;
                result += constant.str.charAt(temp_int);
                break;
            case 1:
                temp_int = (long_int & constant['1']) >> 12;
                result += constant.str.charAt(temp_int);
                break;
            case 2:
                temp_int = (long_int & constant['2']) >> 6;
                result += constant.str.charAt(temp_int);
                break;
            case 3:
                temp_int = long_int & 63;
                result += constant.str.charAt(temp_int);
                break;
            default:
                break;
        }
    }
    return result;
}

function get_long_int(round, long_str) {
    round = round * 3;
    return (long_str.codePointAt(round) << 16) | (long_str.codePointAt(round + 1) << 8) | long_str.codePointAt(round + 2);
}

function gener_random(random, option) {
    return [
        (random & 255 & 170) | (option[0] & 85), // 163
        (random & 255 & 85) | (option[0] & 170), // 87
        ((random >> 8) & 255 & 170) | (option[1] & 85), // 37
        ((random >> 8) & 255 & 85) | (option[1] & 170), // 41
    ];
}

// ////////////////////////////////////////////
function generate_rc4_bb_str(url_search_params, user_agent, window_env_str, suffix = 'cus', Arguments = [0, 1, 14]) {
    const sm3 = new SM3();
    const start_time = Date.now();
    /**
     * 进行3次加密处理
     * 1: url_search_params两次sm3之的结果
     * 2: 对后缀两次sm3之的结果
     * 3: 对ua处理之后的结果
     */
    // url_search_params两次sm3之的结果
    const url_search_params_list = sm3.sum(sm3.sum(url_search_params + suffix));
    // 对后缀两次sm3之的结果
    const cus = sm3.sum(sm3.sum(suffix));
    // 对ua处理之后的结果
    const ua = sm3.sum(result_encrypt(rc4_encrypt(user_agent, Reflect.apply(String.fromCharCode, null, [0.003_906_25, 1, 14])), 's3'));
    //
    const end_time = Date.now();
    // b
    const b = {
        8: 3, // 固定
        10: end_time, // 3次加密结束时间
        15: {
            aid: 6383,
            pageId: 6241,
            boe: false,
            ddrt: 7,
            paths: {
                include: [{}, {}, {}, {}, {}, {}, {}],
                exclude: [],
            },
            track: {
                mode: 0,
                delay: 300,
                paths: [],
            },
            dump: true,
            rpU: '',
        },
        16: start_time, // 3次加密开始时间
        18: 44, // 固定
        19: [1, 0, 1, 5],
    };

    // 3次加密开始时间
    b[20] = (b[16] >> 24) & 255;
    b[21] = (b[16] >> 16) & 255;
    b[22] = (b[16] >> 8) & 255;
    b[23] = b[16] & 255;
    b[24] = (b[16] / 256 / 256 / 256 / 256) >> 0;
    b[25] = (b[16] / 256 / 256 / 256 / 256 / 256) >> 0;

    // 参数Arguments [0, 1, 14, ...]
    // let Arguments = [0, 1, 14]
    b[26] = (Arguments[0] >> 24) & 255;
    b[27] = (Arguments[0] >> 16) & 255;
    b[28] = (Arguments[0] >> 8) & 255;
    b[29] = Arguments[0] & 255;

    b[30] = (Arguments[1] / 256) & 255;
    b[31] = Arguments[1] % 256 & 255;
    b[32] = (Arguments[1] >> 24) & 255;
    b[33] = (Arguments[1] >> 16) & 255;

    b[34] = (Arguments[2] >> 24) & 255;
    b[35] = (Arguments[2] >> 16) & 255;
    b[36] = (Arguments[2] >> 8) & 255;
    b[37] = Arguments[2] & 255;

    // (url_search_params + "cus") 两次sm3之的结果
    /** let url_search_params_list = [
     91, 186,  35,  86, 143, 253,   6,  76,
     34,  21, 167, 148,   7,  42, 192, 219,
     188,  20, 182,  85, 213,  74, 213, 147,
     37, 155,  93, 139,  85, 118, 228, 213
     ]*/
    b[38] = url_search_params_list[21];
    b[39] = url_search_params_list[22];

    // ("cus") 对后缀两次sm3之的结果
    /**
     * let cus = [
     136, 101, 114, 147,  58,  77, 207, 201,
     215, 162, 154,  93, 248,  13, 142, 160,
     105,  73, 215, 241,  83,  58,  51,  43,
     255,  38, 168, 141, 216, 194,  35, 236
     ]*/
    b[40] = cus[21];
    b[41] = cus[22];

    // 对ua处理之后的结果
    /**
     * let ua = [
     129, 190,  70, 186,  86, 196, 199,  53,
     99,  38,  29, 209, 243,  17, 157,  69,
     147, 104,  53,  23, 114, 126,  66, 228,
     135,  30, 168, 185, 109, 156, 251,  88
     ]*/
    b[42] = ua[23];
    b[43] = ua[24];

    // 3次加密结束时间
    b[44] = (b[10] >> 24) & 255;
    b[45] = (b[10] >> 16) & 255;
    b[46] = (b[10] >> 8) & 255;
    b[47] = b[10] & 255;
    b[48] = b[8];
    b[49] = (b[10] / 256 / 256 / 256 / 256) >> 0;
    b[50] = (b[10] / 256 / 256 / 256 / 256 / 256) >> 0;

    // object配置项
    b[51] = b[15].pageId;
    b[52] = (b[15].pageId >> 24) & 255;
    b[53] = (b[15].pageId >> 16) & 255;
    b[54] = (b[15].pageId >> 8) & 255;
    b[55] = b[15].pageId & 255;

    b[56] = b[15].aid;
    b[57] = b[15].aid & 255;
    b[58] = (b[15].aid >> 8) & 255;
    b[59] = (b[15].aid >> 16) & 255;
    b[60] = (b[15].aid >> 24) & 255;

    // 中间进行了环境检测
    // 代码索引:  2496 索引值:  17 （索引64关键条件）
    // '1536|747|1536|834|0|30|0|0|1536|834|1536|864|1525|747|24|24|Win32'.charCodeAt()得到65位数组
    /**
     * let window_env_list = [49, 53, 51, 54, 124, 55, 52, 55, 124, 49, 53, 51, 54, 124, 56, 51, 52, 124, 48, 124, 51,
     * 48, 124, 48, 124, 48, 124, 49, 53, 51, 54, 124, 56, 51, 52, 124, 49, 53, 51, 54, 124, 56,
     * 54, 52, 124, 49, 53, 50, 53, 124, 55, 52, 55, 124, 50, 52, 124, 50, 52, 124, 87, 105, 110,
     * 51, 50]
     */
    const window_env_list: number[] = [];
    for (let index = 0; index < window_env_str.length; index++) {
        window_env_list.push(window_env_str.codePointAt(index));
    }
    b[64] = window_env_list.length;
    b[65] = b[64] & 255;
    b[66] = (b[64] >> 8) & 255;

    b[69] = [].length;
    b[70] = b[69] & 255;
    b[71] = (b[69] >> 8) & 255;

    b[72] =
        b[18] ^
        b[20] ^
        b[26] ^
        b[30] ^
        b[38] ^
        b[40] ^
        b[42] ^
        b[21] ^
        b[27] ^
        b[31] ^
        b[35] ^
        b[39] ^
        b[41] ^
        b[43] ^
        b[22] ^
        b[28] ^
        b[32] ^
        b[36] ^
        b[23] ^
        b[29] ^
        b[33] ^
        b[37] ^
        b[44] ^
        b[45] ^
        b[46] ^
        b[47] ^
        b[48] ^
        b[49] ^
        b[50] ^
        b[24] ^
        b[25] ^
        b[52] ^
        b[53] ^
        b[54] ^
        b[55] ^
        b[57] ^
        b[58] ^
        b[59] ^
        b[60] ^
        b[65] ^
        b[66] ^
        b[70] ^
        b[71];
    let bb = [
        b[18],
        b[20],
        b[52],
        b[26],
        b[30],
        b[34],
        b[58],
        b[38],
        b[40],
        b[53],
        b[42],
        b[21],
        b[27],
        b[54],
        b[55],
        b[31],
        b[35],
        b[57],
        b[39],
        b[41],
        b[43],
        b[22],
        b[28],
        b[32],
        b[60],
        b[36],
        b[23],
        b[29],
        b[33],
        b[37],
        b[44],
        b[45],
        b[59],
        b[46],
        b[47],
        b[48],
        b[49],
        b[50],
        b[24],
        b[25],
        b[65],
        b[66],
        b[70],
        b[71],
    ];
    bb = bb.concat(window_env_list).concat(b[72]);
    return rc4_encrypt(String.fromCharCode.apply(null, bb), Reflect.apply(String.fromCharCode, null, [121]));
}

function generate_random_str() {
    let random_str_list: number[] = [];
    random_str_list = random_str_list.concat(gener_random(Math.random() * 10000, [3, 45]));
    random_str_list = random_str_list.concat(gener_random(Math.random() * 10000, [1, 0]));
    random_str_list = random_str_list.concat(gener_random(Math.random() * 10000, [1, 5]));
    return String.fromCharCode.apply(null, random_str_list);
}

export function generate_a_bogus(url_search_params, user_agent) {
    const result_str = generate_random_str() + generate_rc4_bb_str(url_search_params, user_agent, '1536|747|1536|834|0|30|0|0|1536|834|1536|864|1525|747|24|24|Win32');
    return result_encrypt(result_str, 's4') + '=';
}
