// oxlint-disable unicorn/prefer-spread
// oxlint-disable unicorn/prefer-math-trunc
// @ts-nocheck cryptographic

// Credits:
// https://github.com/NearHuiwen/TiktokDouyinCrawler/blob/main/utils/a_bogus.js
// https://github.com/110Art/a-bogus/blob/main/a_bogus.js
// https://github.com/ShilongLee/Crawler/blob/main/lib/js/douyin.js

import CryptoJS from 'crypto-js';
import { sm3 } from 'sm-crypto-v2';

function rc4_encrypt(plaintext: string, key: string): string {
    const { ciphertext } = CryptoJS.RC4.encrypt(CryptoJS.enc.Latin1.parse(plaintext), CryptoJS.enc.Latin1.parse(key));
    return CryptoJS.enc.Latin1.stringify(ciphertext);
}

// SM3 digest as a byte array; accepts a string or a byte array (for double hashing)
function sm3Sum(message: string | number[]): number[] {
    const hex = sm3(typeof message === 'string' ? message : Uint8Array.from(message));
    const bytes: number[] = [];
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(Number.parseInt(hex.slice(i, i + 2), 16));
    }
    return bytes;
}

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
    round *= 3;
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
    const start_time = Date.now();
    /**
     * 进行3次加密处理
     * 1: url_search_params两次sm3之的结果
     * 2: 对后缀两次sm3之的结果
     * 3: 对ua处理之后的结果
     */
    // url_search_params两次sm3之的结果
    const url_search_params_list = sm3Sum(sm3Sum(url_search_params + suffix));
    // 对后缀两次sm3之的结果
    const cus = sm3Sum(sm3Sum(suffix));
    // 对ua处理之后的结果
    const ua_key = String.fromCodePoint(Math.floor(0.00390625), 1, 14);
    const ua = sm3Sum(result_encrypt(rc4_encrypt(user_agent, ua_key), 's3'));
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
    b[31] = (Arguments[1] % 256) & 255;
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
    return rc4_encrypt(String.fromCodePoint.apply(null, bb), String.fromCodePoint(121));
}

function generate_random_str() {
    let random_str_list: number[] = [];
    random_str_list = random_str_list.concat(gener_random(Math.random() * 10000, [3, 45]));
    random_str_list = random_str_list.concat(gener_random(Math.random() * 10000, [1, 0]));
    random_str_list = random_str_list.concat(gener_random(Math.random() * 10000, [1, 5]));
    return String.fromCodePoint.apply(null, random_str_list);
}

export function generate_a_bogus(url_search_params, user_agent) {
    const result_str = generate_random_str() + generate_rc4_bb_str(url_search_params, user_agent, '1536|747|1536|834|0|30|0|0|1536|834|1536|864|1525|747|24|24|Win32');
    return result_encrypt(result_str, 's4') + '=';
}
