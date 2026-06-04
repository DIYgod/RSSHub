import CryptoJS from 'crypto-js';

const rootUrl = 'https://www.cls.cn';

const params = {
    appName: 'CailianpressWeb',
    os: 'web',
    sv: '8.7.9',
};

const getSearchParams = (moreParams?) => {
    const filtered = Object.fromEntries(Object.entries({ ...params, ...moreParams }).filter(([_, v]) => v !== undefined));
    const searchParams = new URLSearchParams(filtered as Record<string, string>);
    searchParams.sort();
    searchParams.append('sign', CryptoJS.MD5(CryptoJS.SHA1(searchParams.toString()).toString()).toString());
    return Object.fromEntries(searchParams);
};

export { getSearchParams, rootUrl };
