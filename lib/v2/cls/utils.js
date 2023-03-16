const CryptoJS = require('crypto-js');

const getSignedSearchParams = (searchParams) => {
    searchParams = new URLSearchParams(searchParams);
    searchParams.sort();
    searchParams.append('sign', CryptoJS.MD5(CryptoJS.SHA1(searchParams.toString()).toString()).toString());
    return searchParams;
};

module.exports = {
    appName: 'CailianpressWeb',
    os: 'web',
    sv: '7.7.5',
    getSignedSearchParams,
};
