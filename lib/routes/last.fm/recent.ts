import type { Context } from 'hono';
import { html } from 'hono/html';

import { config } from '@/config';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { getPublicTracks } from './utils';

export const route: Route = {
    path: '/recent/:user',
    categories: ['multimedia'],
    example: '/last.fm/recent/yeFoenix',
    parameters: {
        user: 'Last.fm 用户名',
    },
    features: {
        requirePuppeteer: true,
        requireConfig: [
            {
                name: 'LASTFM_API_KEY',
                optional: true,
                description: 'Last.fm API key',
            },
        ],
    },
    radar: [
        {
            source: ['www.last.fm/user/:user', 'www.last.fm/user/:user/*'],
        },
    ],
    name: '用户播放记录',
    description: '未配置 LASTFM\\_API\\_KEY 时使用公开页面，公开页面的时间精度为分钟。',
    maintainers: ['hoilc'],
    handler,
};

async function handler(ctx: Context) {
    const { user } = ctx.req.param();
    if (!config.lastfm?.api_key) {
        return getPublicTracks(user, 'recent');
    }

    const apiKey = config.lastfm.api_key;

    const data = await ofetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${user}&api_key=${apiKey}&format=json`);
    const list = data.recenttracks.track;

    return {
        title: `Recent Tracks by ${data.recenttracks['@attr'].user} - Last.fm`,
        link: `https://www.last.fm/user/${user}/library`,
        item: list.map((item) => {
            const image = item.image?.at(-1)?.['#text'];
            return {
                title: `${item.name} - ${item.artist['#text']}`,
                author: item.artist['#text'],
                description: image ? html`<img src="${image}" />`.toString() : undefined,
                pubDate: item.date?.uts ? parseDate(item.date.uts * 1000) : undefined,
                link: item.url,
                guid: `${item.url}#${item.date?.uts ?? 'nowplaying'}`,
            };
        }),
    };
}
