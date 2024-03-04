// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';

const ProcessCookie = (cookie) => cookie.map((cookie) => cookie.split(';')[0]).join('; ');

const ProcessNewCookie = (oldCookie, newCookie) => {
    const oldCookieArray = oldCookie.split('; ');
    const newCookieArray = newCookie.map((cookie) => cookie.split(';')[0]);
    return [...oldCookieArray, ...newCookieArray].join('; ');
};

module.exports = {
    getCookie: () => {
        const key = 'zhihu-xhu-cookie';
        return cache.tryGet(key, async () => {
            // Get udid
            const udidResponse = await got({
                method: 'get',
                url: 'https://api.zhihuvvv.workers.dev/appcloud/v1/device',
                headers: {
                    Referer: 'https://api.zhihuvvv.workers.dev',
                },
            });
            const udidCookie = ProcessCookie(udidResponse.headers['set-cookie']);

            // Get access token
            const accessTokenResponse = await got({
                method: 'get',
                url: 'https://api.zhihuvvv.workers.dev/guests/token',
                headers: {
                    Referer: 'https://api.zhihuvvv.workers.dev',
                    Cookie: udidCookie,
                },
            });
            const accessTokenCookie = ProcessNewCookie(udidCookie, accessTokenResponse.headers['set-cookie']);
            return accessTokenCookie;
        });
    },
};
