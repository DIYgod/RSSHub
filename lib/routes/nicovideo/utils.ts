import { Essential, UserInfo, VideoItem } from './types';

import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { config } from '@/config';
import path from 'node:path';
import { art } from '@/utils/render';
import { getCurrentPath } from '@/utils/helpers';

const __dirname = getCurrentPath(import.meta.url);

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

export const renderVideo = (video: Essential, embed: boolean) => art(path.join(__dirname, 'templates', 'video.art'), { video, embed });
