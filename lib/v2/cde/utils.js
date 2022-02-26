const got = require('@/utils/got');

const title = '国家药品监督管理局药品审评中心';
const rootUrl = 'https://www.cde.org.cn';

const getCookie = (ctx) =>
    ctx.cache.tryGet(rootUrl, async () => {
        const response = await got.get(rootUrl);

        return response.headers['set-cookie']
            .join()
            .match(/FSSBBIl1UgzbN7N80.*?;/g)
            .join('');
    });

module.exports = {
    title,
    rootUrl,
    getCookie,
};
