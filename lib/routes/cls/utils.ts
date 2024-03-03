// @ts-nocheck
const CryptoJS = require('crypto-js');

const rootUrl = 'https://www.cls.cn';

const params = {
    appName: 'CailianpressWeb',
    os: 'web',
    sv: '7.7.5',
};

const getSearchParams = (moreParams) => {
    const searchParams = new URLSearchParams({ ...params, ...moreParams });
    searchParams.sort();
    searchParams.append('sign', CryptoJS.MD5(CryptoJS.SHA1(searchParams.toString()).toString()).toString());
    return searchParams;
};

module.exports = {
    rootUrl,
    getSearchParams,
};
