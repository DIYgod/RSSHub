import md5 from '@/utils/md5';

const SALT = '1Ftjv0bfpVmqbE38';

const randomChar = () => {
    const random = Math.floor(62 * Math.random());
    if (random < 10) {
        return random;
    }
    if (random < 36) {
        return String.fromCodePoint(random + 55);
    }
    return String.fromCodePoint(random + 61);
};

const getClientVal = (length) => {
    let result = '';
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

export { getClientVal, sign };
