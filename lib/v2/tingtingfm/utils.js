const md5 = require('@/utils/md5');

const SALT = '1Ftjv0bfpVmqbE38';

const getClientVal = (length) => {
    let result = '';
    const randomChar = () => {
        const random = Math.floor(62 * Math.random());
        if (random < 10) {
            return random;
        } else if (random < 36) {
            return String.fromCharCode(random + 55);
        } else {
            return String.fromCharCode(random + 61);
        }
    };
    while (result.length < length) {
        result += randomChar();
    }
    return `h5_${result}`;
};

const sign = (params) => {
    const searchParams = new URLSearchParams(params);
    searchParams.sort();
    return md5(`${searchParams.toString()}_${SALT}`);
};

module.exports = {
    getClientVal,
    sign,
};
