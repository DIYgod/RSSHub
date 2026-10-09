import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const getTokenAndSecret = () =>
    cache.tryGet('qianp:token', async () => {
        const response = await ofetch.raw('https://qianp.com/news/recommend/');
        const token = response.headers
            .getSetCookie()
            .find((cookie) => cookie.startsWith('token='))
            ?.split(';', 1)[0]
            ?.split('=', 2)[1];
        const secret = response.headers
            .getSetCookie()
            .find((cookie) => cookie.startsWith('secret='))
            ?.split(';', 1)[0]
            ?.split('=', 2)[1];
        return { token, secret };
    });

export { getTokenAndSecret };
