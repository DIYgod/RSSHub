import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { config } from '@/config';
import { getAcwScV2ByArg1 } from '@/routes/5eplay/utils';

export const parseToken = (link: string) =>
    cache.tryGet(
        'xueqiu:token',
        async () => {
            const r = await ofetch(link);

            let acw_sc__v2 = '';
            const matches = r.match(/var arg1='(.*?)';/);
            if (matches) {
                acw_sc__v2 = getAcwScV2ByArg1(matches[1]);
            }
            const acw_sc__v2_cookie = `acw_sc__v2=${acw_sc__v2}`;
            const res = await ofetch.raw(link, {
                headers: {
                    Cookie: acw_sc__v2_cookie,
                },
            });
            const cookieArray = res.headers.getSetCookie();
            const xq_a_token_cookie = cookieArray.find((c) => c.startsWith('xq_a_token='));

            return `${acw_sc__v2_cookie}; ${xq_a_token_cookie}`;
        },
        config.cache.routeExpire,
        false
    );
