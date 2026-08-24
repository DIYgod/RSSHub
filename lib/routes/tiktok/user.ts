import { load } from 'cheerio';

import { config } from '@/config';
import { solveWafChallenge } from '@/routes/juejin/utils';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { queryToBoolean } from '@/utils/readable-social';

import { renderUserEmbed } from './templates/user';
import type { EmbedUser, EmbedVideo, Profile } from './types';

const baseUrl = 'https://www.tiktok.com';

export const route: Route = {
    path: '/user/:user/:iframe?',
    categories: ['social-media'],
    example: '/tiktok/user/@linustech/true',
    parameters: { user: 'User ID, including @', iframe: 'Use the official iframe to embed the video, which allows you to view the video if the default option does not work. Default to `false`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.tiktok.com/:user'],
            target: '/user/:user',
        },
    ],
    name: 'User',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { user, iframe } = ctx.req.param();
    const useIframe = queryToBoolean(iframe);
    const handle = user.startsWith('@') ? user : `@${user}`;
    const path = `/embed/${handle}`;

    const profile: Profile = await cache.tryGet(
        `tiktok:user:${handle}`,
        async () => {
            let response = await ofetch(baseUrl + path);
            let $ = load(response);

            if ($('p#wci').hasClass('_wafchallengeid')) {
                const cookie = solveWafChallenge($('p#cs').attr('class')!);
                response = await ofetch(baseUrl + path, {
                    headers: {
                        cookie: `_wafchallengeid=${cookie};`,
                    },
                });
                $ = load(response);
            }

            const state = JSON.parse($('script#__FRONTITY_CONNECT_STATE__').text());
            const { userInfo, videoList }: { userInfo: EmbedUser; videoList: EmbedVideo[] } = state.source.data[path];

            return {
                nickname: userInfo.nickname,
                uniqueId: userInfo.uniqueId,
                signature: userInfo.signature,
                avatar: userInfo.avatarThumbUrl,
                videos: videoList.map((video) => ({
                    id: video.id,
                    desc: video.desc,
                    cover: video.coverUrl,
                    playAddr: video.playAddr,
                    authorUniqueId: video.authorUniqueId,
                    createTime: Number(BigInt(video.id) >> 32n),
                })),
            };
        },
        config.cache.routeExpire,
        false
    );

    const items = profile.videos.map((video) => ({
        title: video.desc,
        description: renderUserEmbed({
            poster: video.cover,
            source: video.playAddr,
            useIframe,
            id: video.id,
        }),
        author: profile.nickname,
        pubDate: parseDate(video.createTime, 'X'),
        link: `${baseUrl}/@${video.authorUniqueId}/video/${video.id}`,
    }));

    return {
        title: `${profile.nickname} (@${profile.uniqueId}) | TikTok`,
        description: profile.signature,
        image: profile.avatar,
        link: `${baseUrl}/@${profile.uniqueId}`,
        item: items,
    };
}
