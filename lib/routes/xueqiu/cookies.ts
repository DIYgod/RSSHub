import { config } from '@/config';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const getHome = (cookie: string) =>
    ofetch.raw<string, 'text'>('https://www.xueqiu.com/', {
        headers: { cookie },
        responseType: 'text',
    });

export const parseToken = () =>
    cache.tryGet(
        'xueqiu:token',
        async () => {
            let challenge = '';
            let response = await getHome(challenge);
            const html = response._data!;
            if (html.includes('EO_Bot_Ssid=')) {
                const status = html.matchAll(/(?:WTKkN|bOYDu|wyeCN):(\d+)/g).reduce((sum, [, value]) => sum + Number(value), 0);
                const ssid = html.match(/,(\d+)\);continue/)![1];
                challenge = `__tst_status=${status}#; EO_Bot_Ssid=${ssid}; `;
                response = await getHome(challenge);
            }
            return (
                challenge +
                response.headers
                    .getSetCookie()
                    .map((cookie) => cookie.split(';', 1)[0])
                    .join('; ')
            );
        },
        config.cache.routeExpire,
        false
    );
