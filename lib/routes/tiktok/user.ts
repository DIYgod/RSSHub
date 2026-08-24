import { load } from 'cheerio';
import { ofetch } from 'ofetch';

import { config } from '@/config';
import { solveWafChallenge } from '@/routes/juejin/utils';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { queryToBoolean } from '@/utils/readable-social';

import { renderUserEmbed } from './templates/user';
import type { EmbedUser, EmbedVideo } from './types';

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
    const path = `/embed/${user.startsWith('@') ? user : `@${user}`}`;

    const data = await cache.tryGet(
        `tiktok:user:${path}`,
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
            const { userInfo, videoList } = state.source.data[path] as { userInfo: EmbedUser; videoList: EmbedVideo[] };

            return { userInfo, videoList };
        },
        config.cache.routeExpire,
        false
    );

    const { userInfo, videoList } = data;

    const items = videoList.map((video: EmbedVideo) => ({
        title: video.desc,
        description: renderUserEmbed({
            poster: video.coverUrl,
            source: video.playAddr,
            useIframe,
            id: video.id,
        }),
        author: userInfo.nickname,
        pubDate: parseDate(Number(BigInt(video.id) >> 32n), 'X'),
        link: `${baseUrl}/@${video.authorUniqueId}/video/${video.id}`,
    }));

    return {
        title: `${userInfo.nickname} (@${userInfo.uniqueId}) | TikTok`,
        description: userInfo.signature,
        image: userInfo.avatarThumbUrl,
        link: `${baseUrl}/@${userInfo.uniqueId}`,
        item: items,
    };
}
