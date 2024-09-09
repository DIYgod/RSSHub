import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { config } from '@/config';
import { getAcwScV2ByArg1 } from '@/routes/5eplay/utils';

export const parseToken = () =>
    cache.tryGet(
        'xueqiu:token',
        async () => {
            const r = await ofetch('https://xueqiu.com');

            let acw_sc__v2 = '';
            const matches = r.match(/var arg1='(.*?)';/);
            if (matches) {
                acw_sc__v2 = getAcwScV2ByArg1(matches[1]);
            }

            const res = await ofetch.raw('https://xueqiu.com', {
                headers: {
                    Cookie: `acw_sc__v2=${acw_sc__v2}`,
                },
            });
            const cookieArray = res.headers.getSetCookie();
            return cookieArray.find((c) => c.startsWith('xq_a_token='));
        },
        config.cache.routeExpire,
        false
    );
