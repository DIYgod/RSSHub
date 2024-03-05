// @ts-nocheck
import got from '@/utils/got';

const getTokenAndSecret = (tryGet) =>
    tryGet('qianp:token', async () => {
        const response = await got('https://qianp.com/news/recommend/');
        const token = response.headers['set-cookie']
            .find((cookie) => cookie.startsWith('token='))
            ?.split(';')[0]
            ?.split('=')[1];
        const secret = response.headers['set-cookie']
            .find((cookie) => cookie.startsWith('secret='))
            ?.split(';')[0]
            ?.split('=')[1];
        return { token, secret };
    });

module.exports = {
    getTokenAndSecret,
};
