import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { config } from '@/config';

export const parseToken = () =>
    cache.tryGet(
        'xueqiu:token',
        async () => {
            const res = await ofetch.raw(`https://xueqiu.com`);
            const cookieArray = res.headers.getSetCookie();
            return cookieArray.find((c) => c.startsWith('xq_a_token='));
        },
        config.cache.routeExpire,
        false
    );
