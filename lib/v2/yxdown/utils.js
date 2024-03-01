const got = require('@/utils/got');

const rootUrl = 'http://www.yxdown.com';

const getCookie = async () => {
    const cookieResponse = await got(rootUrl);

    const cookieRegx = /(?<=.cookie=").*(?=; path)/g;
    const cookieStr = cookieResponse.data.match(cookieRegx)[0];

    return cookieStr;
};

module.exports = {
    rootUrl,
    getCookie,
};
