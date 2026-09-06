import cache from '@/utils/cache';
import got from '@/utils/got';

const getTokenAndSecret = () =>
    cache.tryGet('qianp:token', async () => {
        const response = await got('https://qianp.com/news/recommend/');
        const token = response.headers['set-cookie']
            .find((cookie) => cookie.startsWith('token='))
            ?.split(';', 1)[0]
            ?.split('=', 2)[1];
        const secret = response.headers['set-cookie']
            .find((cookie) => cookie.startsWith('secret='))
            ?.split(';', 1)[0]
            ?.split('=', 2)[1];
        return { token, secret };
    });

export { getTokenAndSecret };
