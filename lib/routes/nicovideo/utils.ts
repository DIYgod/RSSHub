import { Essential, Mylist, UserInfo, VideoItem } from './types';

import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { config } from '@/config';
import path from 'node:path';
import { art } from '@/utils/render';

export const getUserInfoById = (id: string) => cache.tryGet(`nicovideo:user:${id}`, () => ofetch<UserInfo>(`https://embed.nicovideo.jp/users/${id}`)) as Promise<UserInfo>;

export const getUserVideosById = (id: string) =>
    cache.tryGet(
        `nicovideo:user:${id}:videos`,
        async () => {
            const { data } = await ofetch(`https://nvapi.nicovideo.jp/v3/users/${id}/videos`, {
                headers: {
                    'X-Frontend-Id': '6',
                },
                query: {
                    sortKey: 'registeredAt',
                    sortOrder: 'desc',
                    sensitiveContents: 'mask',
                    pageSize: 100,
                    page: 1,
                },
            });

            return data.items;
        },
        config.cache.routeExpire,
        false
    ) as Promise<VideoItem[]>;

export const getMylist = (id: string): Promise<Mylist> =>
    cache.tryGet<Mylist>(
        `nicovideo:mylist:${id}`,
        async () => {
            const { data } = await ofetch(`https://nvapi.nicovideo.jp/v2/mylists/${id}`, {
                headers: {
                    'X-Frontend-Id': '6',
                },
                query: {
                    sortKey: 'addedAt',
                    sortOrder: 'desc',
                    /**
                     * @remarks
                     * Up to 500 items can be registered in a single mylist.
                     * @see https://qa.nicovideo.jp/faq/show/648?site_domain=default
                     */
                    pageSize: 500,
                    page: 1,
                },
            });
            return data.mylist;
        },
        config.cache.routeExpire,
        false
    );

export const renderVideo = (video: Essential, embed: boolean) => art(path.join(__dirname, 'templates/video.art'), { video, embed });
