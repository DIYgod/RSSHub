import CryptoJS from 'crypto-js';

const rootUrl = 'https://www.cls.cn';

const params = {
    appName: 'CailianpressWeb',
    os: 'web',
    sv: '8.7.9',
};

const getSearchParams = (moreParams?: Record<string, string | undefined>) => {
    const searchParams = new URLSearchParams();
    const mergedParams = Object.entries({ ...params, ...moreParams });
    for (const [key, value] of mergedParams) {
        if (value !== undefined) {
            searchParams.append(key, value);
        }
    }
    searchParams.sort();
    const sha1 = CryptoJS.SHA1(searchParams.toString()).toString();
    searchParams.append('sign', CryptoJS.MD5(sha1).toString());
    return Object.fromEntries(searchParams);
};

export { getSearchParams, rootUrl };
