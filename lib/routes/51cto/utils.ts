import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import md5 from '@/utils/md5';

export const getToken = () =>
    cache.tryGet(
        '51cto:token',
        async () => {
            const response = await ofetch('https://api-media.51cto.com/api/token-get');
            return response.data.data.token;
        },
        3600,
        false
    );

export const sign = (requestPath: string, payload: Record<string, any> = {}, timestamp: number, token: string) => {
    payload.timestamp = timestamp;
    payload.token = token;
    const sortedParams = Object.keys(payload).sort();
    return md5(md5(requestPath) + md5(sortedParams + md5(token) + timestamp));
};
