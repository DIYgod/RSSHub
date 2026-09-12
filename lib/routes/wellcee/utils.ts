import { config } from '@/config';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import type { City, District } from './types';

export const baseUrl = 'https://www.wellcee.com';
export const getCitys = () =>
    cache.tryGet<City[]>(
        'wellcee:citys',
        async () => {
            const response = await ofetch<{ data: { citys: City[] } }>(`${baseUrl}/api/home/index`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    lang: '1',
                    userId: '',
                    type: '1',
                }).toString(),
            });

            return response.data.citys;
        },
        config.cache.routeExpire,
        false
    );

export const getDistricts = (cityId: string) =>
    cache.tryGet<District[]>(
        `wellcee:city:${cityId}`,
        async () => {
            const response = await ofetch<{ data: { district: District[] } }>(`${baseUrl}/api/house/filterType`, {
                query: {
                    cityId,
                    lang: '1',
                },
            });

            return response.data.district;
        },
        config.cache.routeExpire,
        false
    );
