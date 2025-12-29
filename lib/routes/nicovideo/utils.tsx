import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import { config } from '@/config';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import type { Essential, Mylist, UserInfo, VideoItem } from './types';

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

export const renderVideo = (video: Essential, embed: boolean) =>
    renderToString(
        <>
            {embed ? (
                <iframe src={`https://embed.nicovideo.jp/watch/${video.id}`} style="top: 0; left: 0; width: 100%; height: 100%; position: absolute; border: 0;" allowfullscreen />
            ) : (
                <img src={video.thumbnail.nHdUrl || video.thumbnail.largeUrl || video.thumbnail.middleUrl} />
            )}
            <br />
            {video.shortDescription ? <>{raw(video.shortDescription)}</> : null}
        </>
    );
