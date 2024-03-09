import cache from '@/utils/cache';
import got from '@/utils/got';
import dayjs from 'dayjs';
import { baseUrl, getPlurk } from './utils';

export default async (ctx) => {
    const keyword = ctx.req.param('keyword');
    const { data: apiResponse } = await got.post(`${baseUrl}/Search/search2`, {
        searchParams: {
            query: keyword,
            start_date: dayjs().subtract(1, 'year').format('YYYY/MM'),
            end_date: dayjs().format('YYYY/MM'),
        },
    });

    const users = apiResponse.users;
    const plurks = apiResponse.plurks;

    const items = await Promise.all(plurks.map((item) => getPlurk(`plurk:${item.plurk_id}`, item, users[item.user_id].display_name, cache.tryGet)));

    ctx.set('data', {
        title: `Search "${keyword}" - Plurk`,
        description: 'Search messages on Plurk',
        image: 'https://s.plurk.com/e8266f512246cdbc2721.jpg',
        link: `${baseUrl}/search?q=${encodeURIComponent(keyword)}`,
        item: items,
    });
};
