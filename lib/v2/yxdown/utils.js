const config = require('@/config').value;
const got = require('@/utils/got');

const rootUrl = 'http://www.yxdown.com';

const getCookie = (tryGet) =>
    tryGet(
        'yxdown:cookie',
        async () => {
            const cookieResponse = await got(rootUrl);

            const cookieRegx = /(?<=.cookie=").*(?=; path)/g;
            const cookieStr = cookieResponse.data.match(cookieRegx)[0];

            return cookieStr;
        },
        config.cache.routeExpire,
        false
    );

module.exports = {
    rootUrl,
    getCookie,
};
