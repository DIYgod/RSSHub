import type { Context } from 'hono';
import { html } from 'hono/html';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/recent/:user',
    categories: ['multimedia'],
    example: '/last.fm/recent/yeFoenix',
    parameters: {
        user: 'Last.fm 用户名',
    },
    features: {
        requireConfig: [
            {
                name: 'LASTFM_API_KEY',
                optional: false,
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
    maintainers: ['hoilc'],
    handler,
};

async function handler(ctx: Context) {
    if (!config.lastfm?.api_key) {
        throw new ConfigNotFoundError('Last.fm RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }

    const { user } = ctx.req.param();
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
            };
        }),
    };
}
