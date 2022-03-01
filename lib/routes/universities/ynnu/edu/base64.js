// https://gitee.com/slice30k/base64-js

const BASE64_MAPPING = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '+',
    '/',
];
const URLSAFE_BASE64_MAPPING = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '-',
    '_',
];

const _toBinary = function (ascii) {
    const binary = [];
    while (ascii > 0) {
        const b = ascii % 2;
        ascii = Math.floor(ascii / 2);
        binary.push(b);
    }
    binary.reverse();
    return binary;
};

const _toDecimal = function (binary) {
    let dec = 0;
    let p = 0;
    for (let i = binary.length - 1; i >= 0; --i) {
        const b = binary[i];
        if (b === 1) {
            dec += Math.pow(2, p);
        }
        ++p;
    }
    return dec;
};

const _toUTF8Binary = function (c, binaryArray) {
    const mustLen = 8 - (c + 1) + (c - 1) * 6;
    const fatLen = binaryArray.length;
    let diff = mustLen - fatLen;
    while (--diff >= 0) {
        binaryArray.unshift(0);
    }
    const binary = [];
    let _c = c;
    while (--_c >= 0) {
        binary.push(1);
    }
    binary.push(0);
    let i = 0;
    const len = 8 - (c + 1);
    for (; i < len; ++i) {
        binary.push(binaryArray[i]);
    }

    for (let j = 0; j < c - 1; ++j) {
        binary.push(1);
        binary.push(0);
        let sum = 6;
        while (--sum >= 0) {
            binary.push(binaryArray[i++]);
        }
    }
    return binary;
};

const _toBinaryArray = function (str) {
    let binaryArray = [];
    let i = 0;
    const len = str.length;
    for (; i < len; ++i) {
        const unicode = str.charCodeAt(i);
        const _tmpBinary = _toBinary(unicode);
        if (unicode < 0x80) {
            let _tmpdiff = 8 - _tmpBinary.length;
            while (--_tmpdiff >= 0) {
                _tmpBinary.unshift(0);
            }
            binaryArray = binaryArray.concat(_tmpBinary);
        } else if (unicode >= 0x80 && unicode <= 0x7ff) {
            binaryArray = binaryArray.concat(_toUTF8Binary(2, _tmpBinary));
        } else if (unicode >= 0x800 && unicode <= 0xffff) {
            // UTF-8 3byte
            binaryArray = binaryArray.concat(_toUTF8Binary(3, _tmpBinary));
        } else if (unicode >= 0x10000 && unicode <= 0x1fffff) {
            // UTF-8 4byte
            binaryArray = binaryArray.concat(_toUTF8Binary(4, _tmpBinary));
        } else if (unicode >= 0x200000 && unicode <= 0x3ffffff) {
            // UTF-8 5byte
            binaryArray = binaryArray.concat(_toUTF8Binary(5, _tmpBinary));
        } else if (unicode >= 4000000 && unicode <= 0x7fffffff) {
            // UTF-8 6byte
            binaryArray = binaryArray.concat(_toUTF8Binary(6, _tmpBinary));
        }
    }
    return binaryArray;
};

const _toUnicodeStr = function (binaryArray) {
    let unicode;
    let unicodeBinary = [];
    let str = '';
    let i = 0;
    const len = binaryArray.length;
    for (; i < len; i++) {
        if (binaryArray[i] === 0) {
            unicode = _toDecimal(binaryArray.slice(i, i + 8));
            str += String.fromCharCode(unicode);
            i += 8;
        } else {
            let sum = 0;
            while (i < len) {
                if (binaryArray[i] === 1) {
                    ++sum;
                } else {
                    break;
                }
                ++i;
            }
            unicodeBinary = unicodeBinary.concat(binaryArray.slice(i + 1, i + 8 - sum));
            i += 8 - sum;
            while (sum > 1) {
                unicodeBinary = unicodeBinary.concat(binaryArray.slice(i + 2, i + 8));
                i += 8;
                --sum;
            }
            unicode = _toDecimal(unicodeBinary);
            str += String.fromCharCode(unicode);
            unicodeBinary = [];
        }
    }
    return str;
};

const _encode = function (str, url_safe) {
    const base64_Index = [];
    const binaryArray = _toBinaryArray(str);
    const dictionary = url_safe ? URLSAFE_BASE64_MAPPING : BASE64_MAPPING;

    let extra_Zero_Count = 0;
    for (let i = 0, len = binaryArray.length; i < len; i += 6) {
        const diff = i + 6 - len;
        if (diff === 2) {
            extra_Zero_Count = 2;
        } else if (diff === 4) {
            extra_Zero_Count = 4;
        }
        let _tmpExtra_Zero_Count = extra_Zero_Count;
        while (--_tmpExtra_Zero_Count >= 0) {
            binaryArray.push(0);
        }
        base64_Index.push(_toDecimal(binaryArray.slice(i, i + 6)));
    }

    let base64 = '';
    for (let i = 0, len = base64_Index.length; i < len; ++i) {
        base64 += dictionary[base64_Index[i]];
    }

    for (let i = 0, len = extra_Zero_Count / 2; i < len; ++i) {
        base64 += '=';
    }
    return base64;
};

const _decode = function (_base64Str, url_safe) {
    const _len = _base64Str.length;
    let extra_Zero_Count = 0;
    const dictionary = url_safe ? URLSAFE_BASE64_MAPPING : BASE64_MAPPING;

    if (_base64Str.charAt(_len - 1) === '=') {
        if (_base64Str.charAt(_len - 2) === '=') {
            // 两个等号说明补了4个0
            extra_Zero_Count = 4;
            _base64Str = _base64Str.substring(0, _len - 2);
        } else {
            // 一个等号说明补了2个0
            extra_Zero_Count = 2;
            _base64Str = _base64Str.substring(0, _len - 1);
        }
    }

    let binaryArray = [];
    let i = 0;
    const len = _base64Str.length;
    for (; i < len; ++i) {
        const c = _base64Str.charAt(i);
        let j = 0;
        const size = dictionary.length;
        for (; j < size; ++j) {
            if (c === dictionary[j]) {
                const _tmp = _toBinary(j);

                /* 不足6位的补0*/
                const _tmpLen = _tmp.length;
                if (6 - _tmpLen > 0) {
                    for (let k = 6 - _tmpLen; k > 0; --k) {
                        _tmp.unshift(0);
                    }
                }
                binaryArray = binaryArray.concat(_tmp);
                break;
            }
        }
    }
    if (extra_Zero_Count > 0) {
        binaryArray = binaryArray.slice(0, binaryArray.length - extra_Zero_Count);
    }
    const str = _toUnicodeStr(binaryArray);
    return str;
};

const __BASE64 = {
    encode(str) {
        return _encode(str, false);
    },
    decode(base64Str) {
        return _decode(base64Str, false);
    },
    urlsafe_encode(str) {
        return _encode(str, true);
    },
    urlsafe_decode(base64Str) {
        return _decode(base64Str, true);
    },
};

module.exports = __BASE64;
