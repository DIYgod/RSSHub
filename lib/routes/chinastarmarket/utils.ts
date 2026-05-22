import CryptoJS from 'crypto-js';

const rootUrl = 'https://www.chinastarmarket.cn';

const params = {
    app: 'stib',
    channel: '100',
    os: 'stibWeb',
    sv: '1.4.3',
};

const getSearchParams = (moreParams) => {
    const searchParams = new URLSearchParams({ ...params, ...moreParams });
    searchParams.sort();
    searchParams.append('sign', CryptoJS.MD5(CryptoJS.SHA1(searchParams.toString()).toString()).toString());
    return searchParams;
};

export { getSearchParams, rootUrl };

