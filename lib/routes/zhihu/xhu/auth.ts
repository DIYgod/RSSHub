import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export default {
    getCookie: () => {
        const key = 'zhihu-xhu-cookie';
        return cache.tryGet(key, async () => {
            // Get udid
            const udidResponse = await ofetch.raw('https://api.zhihuvvv.workers.dev/appcloud/v1/device', {
                method: 'get',
                headers: {
                    Referer: 'https://api.zhihuvvv.workers.dev',
                },
            });
            const udidCookieArray = udidResponse.headers.getSetCookie();
            const udidCookie = udidCookieArray.join('; ');

            // Get access token
            const accessTokenResponse = await ofetch.raw('https://api.zhihuvvv.workers.dev/guests/token', {
                method: 'get',
                headers: {
                    Referer: 'https://api.zhihuvvv.workers.dev',
                    Cookie: udidCookie,
                },
            });
            const accessTokenCookieArray = [...accessTokenResponse.headers.getSetCookie(), ...udidCookieArray];
            const accessTokenCookie = accessTokenCookieArray.join('; ');
            return accessTokenCookie;
        });
    },
};
