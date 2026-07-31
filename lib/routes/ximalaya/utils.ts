import { createCipheriv, randomBytes } from 'node:crypto';
import { crc32 } from 'node:zlib';
/*
const getParams = (ep) => {
    const a1 = 'xkt3a41psizxrh9l';
    const a = [
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59,
        60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43,
        44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1,
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

    const r1 = Array.from(Array.from({ length: 256 }), (v, i) => i);

    let i = '';
    o = 0;
    for (let a = 0; a < 256; a++) {
        o = (o + r1[a] + a1[a % a1.length].charCodeAt()) % 256;
        [r1[a], r1[o]] = [r1[o], r1[a]];
    }

    let a3 = 0;
    o = 0;
    for (const u of a2) {
        a3 = (a3 + 1) % 256;
        o = (o + r1[a3]) % 256;
        [r1[a3], r1[o]] = [r1[o], r1[a3]];
        i += String.fromCharCode(u ^ r1[(r1[a3] + r1[o]) % 256]);
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
        o = Number.parseInt((seed * t.length) / 65536);
        cgStr += t[o];
        t = t.split(t[o]).join('');
    }

    const url = idKey.map((id) => cgStr[id]).join('');
    return url;
};

const getUrl = (r) => {
    const params = getParams(r.ep);
    params.duration = r.duration;
    const paramsArray = Object.keys(params)
        .filter((key) => params[key])
        .map((key) => `${key}=${params[key]}`);
    const url = `https://audiopay.cos.xmcdn.com/download/${r.apiVersion}/${getPath(r.seed, r.fileId)}?${paramsArray.join('&')}`;
    return url;
};
*/

const getRandom16 = (len) =>
    randomBytes(Math.ceil(len / 2))
        .toString('hex')
        .slice(0, len);

const base62 = (num) => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let out = '';
    do {
        out = chars[num % 62] + out;
        num = Math.floor(num / 62);
    } while (num > 0);
    return out.padStart(8, '0');
};

/*
const generateRandomString = (payload, code) => {
    // 8 random hex chars
    const a = 'xxxxxxxx'.replaceAll('x', () => Math.trunc(16 * Math.random()).toString(16));
    // 4 random base36 chars
    const b = Math.random().toString(36).substring(2, 6);
    // Date.now() in base62, left-padded to 8
    const c = base62(Date.now());

    // 5 flag bits -> one base32 char
    let bits = '00000';
    if (payload.csl === true) {
        bits = setCharAt(bits, 4, '1');
    }
    if (payload.ets !== null && payload.ets !== '') {
        bits = setCharAt(bits, 3, '1');
    }
    if (payload.rid && payload.rid.dev !== null && payload.rid.dev !== 0) {
        bits = setCharAt(bits, 1, '1');
    }
    const flags = parseInt(bits, 2).toString(32);

    const head = '' + a + b + c + flags + code;
    const plain = head + crc32(head).toString(16).padStart(8, '0');

    let out;
    try {
        out = base64url(aesEncrypt(plain, 'y3hbnr8d4s2ztjbca1wgxk6mqktf9pxr'));
    } catch {
        out = '';
    }
    return out + '_2';
};

const setCharAt = (str, i, ch) => str.substring(0, i) + ch + str.substring(i + 1);

const aesEncrypt = (plaintext, keyStr) => {
    const key = CryptoJS.lib.WordArray.create(utf8Bytes(keyStr).slice(0, 16));
    const enc = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(plaintext), key, {
        iv: key,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return hexToUint8Array(enc.ciphertext.toString()); // hex string -> bytes
};

const base64url = (bytes) =>
    btoa(String.fromCharCode(...new Uint8Array(bytes)))
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replace(/=+$/, '');
*/

const getXmSign = () => {
    const head = `${getRandom16(8)}${getRandom16(4)}${base62(Date.now())}0202`;
    const key = Buffer.from('y3hbnr8d4s2ztjbca1wgxk6mqktf9pxr').subarray(0, 16);
    const cipher = createCipheriv('aes-128-cbc', key, key);
    const sid = Buffer.concat([cipher.update(head + crc32(head).toString(16).padStart(8, '0'), 'utf8'), cipher.final()]).toString('base64url');
    return `&&${sid}_2`;
};

const decryptUrl = (encryptedUrl) => {
    const o = [
        183, 174, 108, 16, 131, 159, 250, 5, 239, 110, 193, 202, 153, 137, 251, 176, 119, 150, 47, 204, 97, 237, 1, 71, 177, 42, 88, 218, 166, 82, 87, 94, 14, 195, 69, 127, 215, 240, 225, 197, 238, 142, 123, 44, 219, 50, 190, 29,
        181, 186, 169, 98, 139, 185, 152, 13, 141, 76, 6, 157, 200, 132, 182, 49, 20, 116, 136, 43, 155, 194, 101, 231, 162, 242, 151, 213, 53, 60, 26, 134, 211, 56, 28, 223, 107, 161, 199, 15, 229, 61, 96, 41, 66, 158, 254, 21, 165,
        253, 103, 89, 3, 168, 40, 246, 81, 95, 58, 31, 172, 78, 99, 45, 148, 187, 222, 124, 55, 203, 235, 64, 68, 149, 180, 35, 113, 207, 118, 111, 91, 38, 247, 214, 7, 212, 209, 189, 241, 18, 115, 173, 25, 236, 121, 249, 75, 57,
        216, 10, 175, 112, 234, 164, 70, 206, 198, 255, 140, 230, 12, 32, 83, 46, 245, 0, 62, 227, 72, 191, 156, 138, 248, 114, 220, 90, 84, 170, 128, 19, 24, 122, 146, 80, 39, 37, 8, 34, 22, 11, 93, 130, 63, 154, 244, 160, 144, 79,
        23, 133, 92, 54, 102, 210, 65, 67, 27, 196, 201, 106, 143, 52, 74, 100, 217, 179, 48, 233, 126, 117, 184, 226, 85, 171, 167, 86, 2, 147, 17, 135, 228, 252, 105, 30, 192, 129, 178, 120, 36, 145, 51, 163, 77, 205, 73, 4, 188,
        125, 232, 33, 243, 109, 224, 104, 208, 221, 59, 9,
    ];

    const a = [204, 53, 135, 197, 39, 73, 58, 160, 79, 24, 12, 83, 180, 250, 101, 60, 206, 30, 10, 227, 36, 95, 161, 16, 135, 150, 235, 116, 242, 116, 165, 171];

    const padding = '='.repeat((4 - (encryptedUrl.length % 4)) % 4);
    const encryptedData = Buffer.from(encryptedUrl.replace('_', '/').replace('-', '+') + padding, 'base64');
    if (encryptedData.length < 16) {
        return encryptedUrl;
    }
    const data = encryptedData.subarray(0, -16);
    const iv = encryptedData.subarray(-16);
    const decryptedData = new Uint8Array(data);
    for (let i = 0; i < decryptedData.length; i++) {
        decryptedData[i] = o[decryptedData[i]];
    }
    for (let i = 0; i < decryptedData.length; i += 16) {
        const block = decryptedData.subarray(i, i + 16);
        for (const [j, element] of block.entries()) {
            decryptedData[i + j] = element ^ iv[j];
        }
    }
    for (let i = 0; i < decryptedData.length; i += 32) {
        const block = decryptedData.subarray(i, i + 32);
        for (const [j, element] of block.entries()) {
            decryptedData[i + j] = element ^ a[j];
        }
    }
    return Buffer.from(decryptedData).toString('utf8');
};
export { /* getUrl, */ decryptUrl, getRandom16, getXmSign };
