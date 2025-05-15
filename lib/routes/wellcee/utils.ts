import { City, District } from './types';

import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { config } from '@/config';

export const baseUrl = 'https://www.wellcee.com';
export const getCitys = () =>
    cache.tryGet(
        'wellcee:citys',
        async () => {
            const response = await ofetch(`${baseUrl}/api/home/index`, {
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
    ) as Promise<City[]>;

export const getDistricts = (cityId: string) =>
    cache.tryGet(
        `wellcee:city:${cityId}`,
        async () => {
            const response = await ofetch(`${baseUrl}/api/house/filterType`, {
                query: {
                    cityId,
                    lang: '1',
                },
            });

            return response.data.district;
        },
        config.cache.routeExpire,
        false
    ) as Promise<District[]>;
